'use strict';
/*
 validate-fragment.js — gate for a guide body fragment before it is integrated.

   node validate-fragment.js <frag.html> [more.html ...]
   node validate-fragment.js --all          (every build/newguides/*.html)

 Hard failures (exit 1):
   - a raw tag-like `<` inside a code sample (must be `&lt;`);
   - a hand-added highlight span `<span class="c|s|n|k|p|nx|...">` inside code;
   - a double-escaped entity (`&amp;amp;` etc.);
   - duplicate `id="..."` values;
   - an `<h2>`/`<h3>` without `data-toc`;
   - an `<h3>` with no `<h4>` before the next `<h3>`/`<h2>`;
   - an id that is not `^[a-z0-9-]+$`.
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'build', 'newguides');

let files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (process.argv.includes('--all')) {
  files = fs.readdirSync(DIR).filter((f) => f.endsWith('.html')).map((f) => path.join(DIR, f));
}
if (!files.length) { console.log('usage: node validate-fragment.js <frag.html> | --all'); process.exit(1); }

const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let failed = false;

for (const f of files) {
  const abs = path.isAbsolute(f) ? f : path.join(ROOT, f);
  const s = fs.readFileSync(abs, 'utf8');
  const problems = [];

  const sec = (s.match(/<section class="chapter">/g) || []).length;
  const h2 = (s.match(/<h2[ >]/g) || []).length;
  const h2toc = (s.match(/<h2 [^>]*data-toc/g) || []).length;
  const h3 = (s.match(/<h3[ >]/g) || []).length;
  const h3toc = (s.match(/<h3 [^>]*data-toc/g) || []).length;
  const h4 = (s.match(/<h4[ >]/g) || []).length;
  const cw = (s.match(/class="codeWrap"/g) || []).length;
  if (h2 !== sec) problems.push('h2(' + h2 + ') != sections(' + sec + ')');
  if (h2 !== h2toc) problems.push((h2 - h2toc) + ' <h2> without data-toc');
  if (h3 !== h3toc) problems.push((h3 - h3toc) + ' <h3> without data-toc');

  // h3 must have an h4 before the next heading (a glossary is exempt: it is a
  // definition list, not a section that needs sub-structure)
  const segs = s.split(/(?=<h[23]\b)/);
  let h3WithoutH4 = 0;
  for (const seg of segs) {
    if (/^<h3\b/.test(seg) && !/<h4[ >]/.test(seg) && !/glossary/i.test(seg.slice(0, 160))) h3WithoutH4++;
  }
  if (h3WithoutH4) problems.push(h3WithoutH4 + ' <h3> with no <h4>');

  // ids — only real elements. A code sample may show `id="err-${name}"` as
  // content; that is not an element and must not be judged as one.
  const noCode = s.replace(codeRe, '<div class="codeWrap"></div>');
  const ids = [...noCode.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Map();
  for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
  const dups = [...seen.entries()].filter(([, n]) => n > 1);
  if (dups.length) problems.push('duplicate ids: ' + dups.slice(0, 12).map(([i, n]) => i + '(' + n + ')').join(', '));
  const badId = ids.filter((i) => !/^[a-z0-9-]+$/.test(i));
  if (badId.length) problems.push('non URL-safe ids: ' + [...new Set(badId)].slice(0, 8).join(', '));

  // code-sample checks
  let m, raw = 0, hl = 0, dbl = 0, blocks = 0, rawEx = [];
  while ((m = codeRe.exec(s))) {
    blocks++;
    const body = m[1];
    const r = (body.match(/<(?=[a-zA-Z/!])/g) || []).length;
    raw += r;
    if (r) rawEx.push(body.slice(Math.max(0, body.search(/<(?=[a-zA-Z/!])/) - 20), body.search(/<(?=[a-zA-Z/!])/) + 30).replace(/\n/g, '\\n'));
    hl += (body.match(/<span class="[a-z]+"/g) || []).length;
    dbl += (body.match(/&amp;(amp|lt|gt|quot|middot|nbsp);/g) || []).length;
  }
  if (raw) problems.push(raw + ' raw tag-like `<` inside code (' + rawEx.slice(0, 3).map((x) => JSON.stringify(x)).join(' | ') + ')');
  if (hl) problems.push(hl + ' highlight spans inside code');
  if (dbl) problems.push(dbl + ' double-escaped entities');

  const tag = problems.length ? 'FAIL' : 'ok  ';
  console.log(tag + ' ' + path.basename(f) + '  sec=' + sec + ' h3=' + h3 + ' h4=' + h4 + ' code=' + cw);
  if (problems.length) { failed = true; problems.forEach((p) => console.log('       - ' + p)); }
}
process.exit(failed ? 1 : 0);
