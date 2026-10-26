/* fixrn2.js — rebuild the empty sidebar TOC in react-native.html from the
 * page's own data-toc headings, and correct the band counts to what is
 * actually on disk.
 *
 * Two separate faults are repaired here:
 *   1. <nav id="toc"> is EMPTY. A guide whose sidebar is empty reports zero
 *      headings to the shell, so search, scroll-spy and the Browse panel all
 *      have nothing to work with. Rebuilt from the headings themselves.
 *   2. The band claims 15 chapters / 85 topics / 140 code samples while the
 *      file holds 8 / 45 / 73. Recounted and rewritten.
 *
 * Every replacement carries its own length; the byte delta is asserted.
 *
 * Run: node build/tmp/fixrn2.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const F = path.join(ROOT, 'react-native.html');
let src = fs.readFileSync(F, 'utf8');

const NL = src.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

if (src.indexOf('<!-- toc rebuilt by fixrn2.js -->') !== -1) {
  console.log('SKIP: already patched'); process.exit(0);
}

/* ---------- 1. collect headings in document order ---------- */
const heads = [...src.matchAll(/<h([23]) id="([^"]+)" data-toc>([\s\S]*?)<\/h\1>/g)]
  .map(m => ({ lvl: +m[1], id: m[2], text: strip(m[3]) }));
if (heads.length < 10) { console.error('FAIL: only ' + heads.length + ' headings found'); process.exit(1); }

/* chapters = h2 (level 2); each h3 nests under the chapter that precedes it */
const chapters = [];
let cur = null;
for (const h of heads) {
  if (h.lvl === 2) { cur = { id: h.id, text: h.text, subs: [] }; chapters.push(cur); }
  else if (cur) cur.subs.push({ id: h.id, text: h.text });
}

/* ---------- 2. build the sidebar markup ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let toc = '  <nav id="toc" aria-label="Table of contents"><ul>';
for (const c of chapters) {
  toc += NL + '    <li class="chapter open"><span class="arrow">&#9656;</span>' +
    '<a href="#' + c.id + '" data-target="' + c.id + '">' + esc(c.text) + '</a>';
  if (c.subs.length) {
    toc += '<ul>' + NL;
    for (const s of c.subs) {
      toc += '      <li><a href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.text) + '</a></li>' + NL;
    }
    toc += '    </ul>' + NL;
  }
  toc += '    </li>' + NL;
}
toc += '  </ul>' + NL + '  <!-- toc rebuilt by fixrn2.js -->' + NL + '  </nav>';

const EMPTY = '<nav id="toc" aria-label="Table of contents"></nav>';
if (src.indexOf(EMPTY) === -1) { console.error('FAIL: empty sidebar not found (already patched?)'); process.exit(1); }
const beforeToc = src.length;
src = src.replace(EMPTY, () => toc);
const tocDelta = src.length - beforeToc;

/* ---------- 3. fix the band counts ---------- */
const h2n = chapters.length;
const h3n = heads.length - h2n;
const codeN = (src.match(/<div class="codeWrap"><pre><code>/g) || []).length;
const bandRe = /<span class="am-band-s">[^<]*<\/span>/;
const bandOld = (src.match(bandRe) || [])[0];
if (!bandOld) { console.error('FAIL: band not found'); process.exit(1); }
const bandNew = '<span class="am-band-s">' + h2n + ' chapters &middot; ' + h3n +
  ' topics &middot; ' + codeN + ' code samples &middot; works offline</span>';
const beforeBand = src.length;
src = src.replace(bandRe, () => bandNew);
const bandDelta = src.length - beforeBand;

/* ---------- 4. assertions ---------- */
const nav = src.match(/<nav id="toc"[\s\S]*?<\/nav>/);
if (!nav) { console.error('FAIL: sidebar not parseable after patch'); process.exit(1); }
const links = [...nav[0].matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
const ids = heads.map(h => h.id);
if (links.join() !== ids.join()) {
  console.error('FAIL: sidebar order != heading order');
  console.error('  want ' + ids.join(','));
  console.error('  got  ' + links.join(','));
  process.exit(1);
}
if (src.indexOf(bandNew) === -1) { console.error('FAIL: band not written'); process.exit(1); }

fs.writeFileSync(F, src, 'utf8');
console.log('OK: sidebar rebuilt (' + links.length + ' links, +' + tocDelta + ' bytes)');
console.log('OK: band recount ' + h2n + ' chapters / ' + h3n + ' topics / ' + codeN + ' code samples (' + bandDelta + ')');
