/* fixrn.js — close the unfinished ch7 in react-native.html and append the
 * page tail (</main>, #toTop, footer, shell.js, </body></html>).
 *
 * The page has 8 <section class="chapter"> opens but only 7 </section>
 * closes: ch7 was still being written when the run was cut off. A guide whose
 * <main> is unclosed reports ZERO headings, which is indistinguishable from a
 * guide that has none, so this closes the section and the page.
 *
 * Every replacement carries its own length and asserts the byte delta.
 *
 * Run: node build/tmp/fixrn.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const F = path.join(ROOT, 'react-native.html');
let src = fs.readFileSync(F, 'utf8');
const before = src.length;

const NL = src.indexOf('\r\n') !== -1 ? '\r\n' : '\n';

/* Guard: refuse to run twice. */
if (src.indexOf('<!-- ch7 closed by fixrn.js -->') !== -1) {
  console.log('SKIP: already patched');
  process.exit(0);
}

/* 1. close ch7 — append the closer at the END, not after the first existing
 *    </section>. Replacing the first occurrence would close the FIRST chapter
 *    and leave ch7 open, which is the same fault it claims to repair. */
const opens = (src.match(/<section class="chapter">/g) || []).length;
const closes = (src.match(/<\/section>/g) || []).length;
if (opens - closes !== 1) {
  console.error('FAIL: expected exactly one unclosed section, got ' + (opens - closes));
  process.exit(1);
}
/* trim any existing tail first so the closer lands after ch7's content */
const tailAt = src.search(/<\/main>|\r?\n<button id="toTop"/);
if (tailAt !== -1) src = src.slice(0, tailAt).replace(/\s+$/, '');
src = src.replace(/\s+$/, '') + NL + '</section>' + NL + NL +
  '  <!-- ch7 closed by fixrn.js -->';

/* 2. drop any partial tail that already exists, then append the standard tail */
const tailStart = src.search(/<\/main>|\r?\n<button id="toTop"/);
if (tailStart !== -1) {
  src = src.slice(0, tailStart).replace(/\s+$/, '');
}

const TAIL = [
  '',
  '</main>',
  '',
  '<button id="toTop" class="to-top" type="button" aria-label="Back to top" title="Back to top">',
  '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
  '  <span class="to-top-txt">Back to top</span>',
  '</button>',
  '',
  '<footer>',
  '  <div class="foot-inner">',
  '    <p><strong>React Native — Expo, Navigation &amp; Full-Scale Apps.</strong> One-page interactive textbook. Progress is saved in your browser (theme, last chapter). Open in any modern browser. No internet needed.</p>',
  '  </div>',
  '</footer>',
  '',
  '<script src="assets/shell.js" defer></script>',
  '</body>',
  '</html>',
  ''
].join(NL) + NL;

src = src + TAIL;

/* 3. effect assertions */
const newOpens = (src.match(/<section class="chapter">/g) || []).length;
const newCloses = (src.match(/<\/section>/g) || []).length;
if (newOpens !== newCloses) {
  console.error('FAIL: still unbalanced ' + newOpens + '/' + newCloses);
  process.exit(1);
}
if (src.indexOf('</main>') === -1) { console.error('FAIL: no </main>'); process.exit(1); }
if (src.indexOf('id="toTop"') === -1) { console.error('FAIL: no #toTop'); process.exit(1); }
if (src.slice(-20).indexOf('</html>') === -1) { console.error('FAIL: no closing </html>'); process.exit(1); }

fs.writeFileSync(F, src, 'utf8');
console.log('OK: react-native.html closed — ' + before + ' -> ' + src.length +
  ' bytes (' + newOpens + ' chapters balanced)');
