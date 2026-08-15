#!/usr/bin/env node
'use strict';

/**
 * Saint Core Holdings — shared-partial build.
 *
 * The site is plain static HTML served straight from the repo by Cloudflare
 * Pages. That is worth keeping: no framework, no deploy-time build, every
 * page fully rendered in the initial HTML for crawlers.
 *
 * What it does NOT do is stop the header and footer from being copy-pasted
 * into fourteen files, which is how the footer drifted into carrying two
 * different phone numbers.
 *
 * So: the shared regions live in partials/, and this script writes them into
 * each page between marker comments. Output is still ordinary static HTML —
 * nothing changes about how the site deploys or is served.
 *
 *   node build.js          inject partials into every page
 *   node build.js --check  verify every page is in sync; exit 1 if not
 *
 * After editing partials/header.html or partials/footer.html, run
 * `node build.js` and commit the result.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PARTS = ['header', 'footer'];
const CHECK = process.argv.includes('--check');

const note = (name) =>
  `<!-- #${name} — generated from partials/${name}.html by build.js. ` +
  `Do not edit here; edit the partial and run: node build.js -->`;
const closeMark = (name) => `<!-- /#${name} -->`;

// Matches an existing managed block, whatever the note currently says.
const managedRe = (name) =>
  new RegExp(`[ \\t]*<!-- #${name}\\b[\\s\\S]*?<!-- /#${name} -->\\n`);

// One-time migration: the raw block as it appears in a not-yet-managed page.
const rawRe = {
  header: /[ \t]*<header>[\s\S]*?<\/header>\n/,
  footer: /[ \t]*<footer class="footer">[\s\S]*?<\/footer>\n/,
};

function pages() {
  const out = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .map((f) => f);
  const sub = path.join(ROOT, 'portfolio');
  if (fs.existsSync(sub)) {
    for (const f of fs.readdirSync(sub)) {
      if (f.endsWith('.html')) out.push(path.join('portfolio', f));
    }
  }
  return out.sort();
}

const partial = {};
for (const name of PARTS) {
  const p = path.join(ROOT, 'partials', `${name}.html`);
  if (!fs.existsSync(p)) {
    console.error(`missing partial: partials/${name}.html`);
    process.exit(1);
  }
  // Store without a trailing newline; the block template adds it back.
  partial[name] = fs.readFileSync(p, 'utf8').replace(/\n$/, '');
}

const block = (name) =>
  `    ${note(name)}\n${partial[name]}\n    ${closeMark(name)}\n`;

let changed = [];
let missing = [];

for (const rel of pages()) {
  const file = path.join(ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  for (const name of PARTS) {
    const managed = managedRe(name);
    if (managed.test(after)) {
      after = after.replace(managed, block(name));
    } else if (rawRe[name].test(after)) {
      after = after.replace(rawRe[name], block(name)); // migrate in place
    } else {
      missing.push(`${rel}: no ${name} region found`);
    }
  }

  if (after !== before) {
    changed.push(rel);
    if (!CHECK) fs.writeFileSync(file, after);
  }
}

if (missing.length) {
  console.error('PROBLEM:\n  ' + missing.join('\n  '));
  process.exit(1);
}

if (CHECK) {
  if (changed.length) {
    console.error(
      `out of sync with partials/ (${changed.length}):\n  ` + changed.join('\n  ')
    );
    console.error('\nrun: node build.js');
    process.exit(1);
  }
  console.log(`in sync: header + footer match partials/ in all ${pages().length} pages`);
} else {
  console.log(
    changed.length
      ? `updated ${changed.length} of ${pages().length} pages:\n  ` + changed.join('\n  ')
      : `already up to date (${pages().length} pages)`
  );
}
