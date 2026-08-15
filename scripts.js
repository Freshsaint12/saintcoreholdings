// Saint Core Holdings — shared scripts (vanilla, no deps)
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav drawer ──
  const toggle = document.querySelector('.nav-toggle');
  const groups = document.querySelectorAll('.nav-group');
  const nav = document.querySelector('.nav-frame');
  if (toggle) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      groups.forEach((g) => g.classList.toggle('is-open', open));
      // Opaque bar while the drawer is open, so page content behind it does
      // not ghost through the translucent nav background.
      if (nav) nav.classList.toggle('is-nav-open', open);
    };
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Close when a nav link is chosen
    groups.forEach((g) => {
      g.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => setOpen(false));
      });
    });

    // Escape closes the drawer and returns focus to the toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Clicking outside the nav closes the drawer
    document.addEventListener('click', (e) => {
      if (isOpen() && nav && !nav.contains(e.target)) setOpen(false);
    });

    // Leaving the mobile breakpoint resets drawer state
    const mq = window.matchMedia('(min-width: 821px)');
    const onChange = (e) => { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  // ── Active-link highlighter ──
  // Normalize so the match works whether the host serves clean URLs
  // (/portfolio, as Cloudflare Pages does) or raw files (/portfolio.html).
  const path = window.location.pathname
    .replace(/\/index\.html?$/, '/')
    .replace(/\.html?$/, '')
    .replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-group a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    // Normalize: strip trailing slash, strip .html, treat empty as /
    const target = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const exact = path === target;
    const ancestor = target !== '/' && path.startsWith(target + '/');
    if (exact || ancestor) {
      a.classList.add('is-active');
      // "page" is reserved for the page you are actually on; an ancestor
      // (e.g. /portfolio while viewing /portfolio/shopos) is "true".
      a.setAttribute('aria-current', exact ? 'page' : 'true');
    }
  });

  // ── gtag CTA event wrapper ──
  // Bound before any motion guard: analytics must work for every visitor,
  // including those who prefer reduced motion.
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      if (typeof window.gtag !== 'function') return;
      try {
        window.gtag('event', 'cta_click', {
          cta_label: el.getAttribute('data-track') || el.textContent.trim().slice(0, 40),
          cta_destination: el.getAttribute('href') || '',
        });
      } catch (_e) { /* noop */ }
    });
  });

  // ── Everything below is decorative motion only ──
  if (reduced) return;

  // ── Reveal on scroll ──
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ── Scroll progress bar ──
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(Math.max(pct, 0), 1) + ')';
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ── Magnetic hover on portfolio cards (pointer devices only) ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.04;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.04;
        el.style.transform =
          'translate3d(' + Math.max(-6, Math.min(6, x)) + 'px,' + Math.max(-6, Math.min(6, y - 4)) + 'px,0)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
      // A focused card must not keep a stale hover offset
      el.addEventListener('blur', () => {
        el.style.transform = '';
      });
    });
  }
})();
