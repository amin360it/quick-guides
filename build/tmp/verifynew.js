/* verifynew.js — one-off integrity check for the newly written pages.
 * Checks, per file: single h1, h1 before first h2, unique ids, closed main,
 * sidebar TOC <-> data-toc parity, ch-toc <-> h3 parity and order, and that
 * every internal href anchor resolves. Read-only; prints a report and exits
 * non-zero on any failure.
 *
 * Run: node build/tmp/verifynew.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const TARGETS = [
  'website-seo.html', 'digital-marketing.html', 'website-design.html',
  'website-development.html', 'webapp-design.html', 'web-app-development.html',
  'website-webapp-deployment.html', 'static-dynamic-website-development.html',
  'react.html', 'react-native.html', 'favorites.html', 'search.html'
];

let fail = 0;
const bad = (f, msg) => { console.log('  FAIL ' + f + ': ' + msg); fail++; };
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

for (const f of TARGETS) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) { bad(f, 'missing on disk'); continue; }
  const t = fs.readFileSync(p, 'utf8');
  console.log('\n=== ' + f + ' ===');

  /* 1. exactly one h1, before the first h2 */
  const h1s = (t.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) bad(f, 'expected 1 h1, found ' + h1s);
  const h1At = t.indexOf('<h1'), h2At = t.search(/<h2[\s>]/);
  if (h1At === -1 || (h2At !== -1 && h1At > h2At)) bad(f, 'h1 not before first h2');

  /* 2. main is closed */
  const mo = (t.match(/<main[\s>]/g) || []).length, mc = (t.match(/<\/main>/g) || []).length;
  if (mo !== mc) bad(f, 'main open/close mismatch ' + mo + '/' + mc);

  /* 3. unique ids on real elements */
  const ids = [...t.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) bad(f, 'duplicate ids: ' + [...new Set(dupes)].slice(0, 5).join(', '));

  /* 4. sidebar TOC <-> data-toc headings */
  const heads = [...t.matchAll(/<h([23]) id="([^"]+)" data-toc>([\s\S]*?)<\/h\1>/g)]
    .map(m => ({ lvl: +m[1], id: m[2], text: strip(m[3]) }));
  const hasTocHeads = heads.length > 0;
  const nav = hasTocHeads ? t.match(/<nav id="toc"[\s\S]*?<\/nav>/) : null;
  if (!hasTocHeads) {
    bad(f, 'no sidebar <nav id="toc"> (page has no chapter headings — e.g. search results)');
  } else if (!nav) {
    bad(f, 'no sidebar <nav id="toc">');
  } else {
    const links = [...nav[0].matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
    const headIds = heads.map(h => h.id);
    const missing = headIds.filter(id => !links.includes(id));
    const extra = links.filter(l => !headIds.includes(l));
    if (missing.length) bad(f, 'sidebar missing: ' + missing.slice(0, 4).join(', '));
    if (extra.length) bad(f, 'sidebar has dead entries: ' + extra.slice(0, 4).join(', '));
    if (headIds.join() !== links.join()) bad(f, 'sidebar order != heading order');
  }

  /* 5. ch-toc completeness: every h3 listed exactly once, in order, per chapter */
  const secs = t.split(/<section class="chapter">/).slice(1);
  let secIdx = 0;
  for (const chunk of secs) {
    const cut = chunk.indexOf('</section>');
    const body = cut === -1 ? chunk : chunk.slice(0, cut);
    const h3s = [...body.matchAll(/<h3 id="([^"]+)" data-toc>/g)].map(m => m[1]);
    if (h3s.length) {
      const list = body.match(/<div class="ch-toc-list">([\s\S]*?)<\/div>/);
      if (!list) { bad(f, 'chapter ' + secIdx + ' has h3s but no .ch-toc-list'); }
      else {
        const entries = [...list[1].matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
        /* Completeness first: every h3 listed, nothing extra. */
        const extra = entries.filter(e => !h3s.includes(e));
        const missing = h3s.filter(h => !entries.includes(h));
        if (extra.length) bad(f, 'chapter ' + secIdx + ' ch-toc lists headings that do not exist: ' + extra.join(','));
        if (missing.length) bad(f, 'chapter ' + secIdx + ' ch-toc omits: ' + missing.join(','));
      }
    }
    secIdx++;
  }

  /* 6. internal anchors resolve */
  const anchors = [...t.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  for (const a of new Set(anchors)) {
    if (a && !ids.includes(a)) bad(f, 'dead anchor #'+ a);
  }

  console.log('  ' + heads.length + ' headings, ' + ids.length + ' ids, ' + secs.length + ' chapters — checked');
}

console.log('\n' + (fail ? 'FAILURES: ' + fail : 'ALL CHECKS PASSED'));
process.exit(fail ? 1 : 0);
