/* spliceicons.js â€” embed GUIDE_ICONS + hydration into assets/shell.js.
 *
 * One pass, fully asserted:
 *   A) insert the icon map + guideIcon() helper + card hydration immediately
 *      before `var GUIDES = [`
 *   B) inject the mark into each Browse Guides row right after its href set
 *   C) refuse to write unless every marker occurred exactly once and the
 *      byte delta equals the exact lengths of A + B (AGENTS repair rules:
 *      assert the effect, never rely on it).
 *
 * Data source: build/tmp/guideicons.json (produced by geticons.js).
 * Run: node build/tmp/spliceicons.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const JS = path.join(ROOT, 'assets', 'shell.js');
const JSON_FILE = path.join(__dirname, 'guideicons.json');

let src = fs.readFileSync(JS, 'utf8');
const before = src.length;

/* guard: never splice twice */
if (src.indexOf('GUIDE_ICONS') !== -1) {
  console.error('FAIL: GUIDE_ICONS already present in shell.js â€” remove it first.');
  process.exit(1);
}

/* ---- load + sanitise the icon map ---- */
const raw = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
const keys = Object.keys(raw);
if (keys.length < 60) { console.error('FAIL: only ' + keys.length + ' icons in map'); process.exit(1); }
for (const k of keys) {
  if (/[\u2028\u2029]/.test(raw[k])) { console.error('FAIL: line separator in ' + k); process.exit(1); }
}
const json = JSON.stringify(raw);           // minified, valid as a JS object literal

/* ---- block A: map + helper + card hydration ---- */
const MARK_A = 'var GUIDES = [';
if (src.split(MARK_A).length - 1 !== 1) {
  console.error('FAIL[A]: expected exactly 1 occurrence of ' + JSON.stringify(MARK_A));
  process.exit(1);
}

const blockA = `/* ---------- Guide marks ---------------------------------------------------
   GUIDE_ICONS: guide file -> inner markup of a 24x24 monochrome glyph, every
   fill/stroke currentColor so it follows theme and contrast tokens. Built by
   build/tmp/geticons.js (simple-icons fetched ONCE at build time, plus
   hand-drawn glyphs) -> guideicons.json; spliced here by spliceicons.js.
   Regenerate there, never hand-edit this literal.

   The letter avatar in each card remains the no-JS fallback: hydration below
   swaps it for the exact mark only when one is known. */
var GUIDE_ICONS = ${json};

function guideIcon(file) {
  var inner = GUIDE_ICONS[file];
  if (!inner) return null;
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'am-glyph');
  svg.innerHTML = inner;
  return svg;
}
(function hydrateCardIcons() {
  var cards = document.querySelectorAll('.am-card[data-file]');
  for (var i = 0; i < cards.length; i++) {
    var g = guideIcon(cards[i].getAttribute('data-file'));
    if (!g) continue;
    var ic = cards[i].querySelector('.am-card-ic');
    if (ic) { while (ic.firstChild) ic.removeChild(ic.firstChild); ic.appendChild(g); }
  }
})();

`;

src = src.replace(MARK_A, () => blockA + MARK_A);

/* ---- block B: Browse Guides row injection ---- */
const ROW_MARK = "el('a', 'tn-link' + (isCur ? ' cur' : ''), it.label)";
const HREF_MARK = 'a.href = it.file;';
const rAt = src.indexOf(ROW_MARK);
if (rAt === -1 || src.indexOf(ROW_MARK, rAt + 1) !== -1) {
  console.error('FAIL[B]: row builder mark not unique');
  process.exit(1);
}
const hAt = src.indexOf(HREF_MARK, rAt);
if (hAt === -1 || src.indexOf(HREF_MARK, hAt + 1) !== -1) {
  console.error('FAIL[B]: href mark not unique after row builder');
  process.exit(1);
}
const blockB = `
          var gi = guideIcon(it.file);
          if (gi) {
            a.textContent = '';
            a.appendChild(gi);
            a.appendChild(document.createTextNode(it.label));
          }`;
const insertAt = hAt + HREF_MARK.length;
src = src.slice(0, insertAt) + blockB + src.slice(insertAt);

/* ---- effect assertion: byte delta must equal exactly A + B ---- */
const markA = 'var GUIDES = [';
const delta = src.length - before;
const expected = blockA.length + blockB.length;
if (delta !== expected) {
  console.error('FAIL: size delta ' + delta + ' != expected ' + expected);
  process.exit(1);
}
if (src.indexOf('var GUIDE_ICONS = ') === -1) { console.error('FAIL: map missing after splice'); process.exit(1); }

fs.writeFileSync(JS, src, 'utf8');
console.log('OK: shell.js ' + before + ' -> ' + src.length + ' bytes (+' + delta + ')');
console.log('    ' + keys.length + ' guide marks embedded; card + browse-row hydration live');
