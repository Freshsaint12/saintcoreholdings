# Saint Core Holdings — website

Static site. Plain HTML, one stylesheet, one script, no framework and no
dependencies. Cloudflare Pages serves the repository directly.

## Editing the site

Most edits are just editing the HTML file for that page.

**The header and footer are the exception.** They appear on all 14 pages, so
they live in `partials/` and are written into each page by a small build
script. Editing them in a page directly will not stick — the next build
overwrites it.

```
partials/header.html    the top navigation
partials/footer.html    the five-column footer
```

To change the nav or footer:

```bash
# 1. edit partials/header.html or partials/footer.html
# 2. write it into every page
node build.js
# 3. commit both the partial and the regenerated pages
```

To confirm every page matches the partials without changing anything:

```bash
node build.js --check
```

That exits non-zero and names the offending files if any page has drifted.
Worth running before you commit.

### Why a build step

The footer used to be copy-pasted into every page. It drifted: some pages
carried one phone number, others carried a different one, and one page showed
both. The build step makes that impossible — there is one copy, and the pages
are generated from it.

The generated HTML is committed and deployed as-is, so the site is still
completely static. Cloudflare Pages needs no build command, and every page is
fully rendered in the initial HTML for search crawlers.

## Layout

```
index.html            home
thesis.html           operating thesis
portfolio.html        portfolio index
about.html            about
partner.html          partnership paths
privacy.html          privacy policy
terms.html            terms of service
404.html              not-found page (Cloudflare Pages serves this automatically)
portfolio/*.html      one page per product

partials/             header + footer, written into pages by build.js
build.js              the build script
styles.css            all styling
scripts.js            nav, scroll reveal, analytics events

_headers              security headers + caching (Cloudflare Pages)
_redirects            legacy URL redirects (Cloudflare Pages)
robots.txt            crawler rules
sitemap.xml           page list for search engines
site.webmanifest      PWA metadata
```

## Deployment

Pushing to `main` deploys. Cloudflare Pages serves the repository as static
files — there is no build command configured, and adding one is not needed.

Clean URLs are automatic: `about.html` is served at `/about`.

## Product accent colours

Each product page sets `data-accent` on `<body>`, and each portfolio card sets
it on the card. That switches `--accent`, which drives the icon, badge, links
and hero glow. Values are defined near the bottom of `styles.css`. All six are
checked to at least 7.8:1 contrast on the card background.

## Things worth knowing before changing config

- **`_headers` carries a Content-Security-Policy.** Any new third-party
  script, font, or embed must be added to it or the browser will block it.
  Cloudflare's own Rocket Loader and Web Analytics injections are already
  allowed for.
- **Do not add `no-transform` to `Cache-Control`.** It stops Cloudflare from
  injecting the Web Analytics beacon.
- **HSTS is set without `includeSubDomains`.** Add it only once every
  subdomain is confirmed to serve HTTPS — it is a one-year commitment that is
  painful to undo.
