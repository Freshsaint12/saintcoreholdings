// Saint Core Holdings — shared scripts (vanilla, no deps)
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav drawer ──
  const toggle = document.querySelector('.nav-toggle');
  const groups = document.querySelectorAll('.nav-group');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      groups.forEach((g) => g.classList.toggle('is-open'));
    });
    // Close drawer when clicking any nav link
    groups.forEach((g) => {
      g.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          groups.forEach((gg) => gg.classList.remove('is-open'));
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    });
  }

  // ── Active-link highlighter ──
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-group a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    // Normalize: strip trailing slash, strip .html, treat empty as /
    const target = href.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (target !== '/' && path === target) a.classList.add('is-active');
    if (target !== '/' && path.startsWith(target + '/')) a.classList.add('is-active');
    if (target === '/' && path === '/') a.classList.add('is-active');
  });

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
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  // ── Magnetic hover on portfolio cards ──
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
  });

  // ── gtag CTA event wrapper ──
  if (typeof window.gtag === 'function') {
    document.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener('click', () => {
        try {
          window.gtag('event', 'cta_click', {
            cta_label: el.getAttribute('data-track') || el.textContent.trim().slice(0, 40),
            cta_destination: el.getAttribute('href') || '',
          });
        } catch (_e) { /* noop */ }
      });
    });
  }
})();
