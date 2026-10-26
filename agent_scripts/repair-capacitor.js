'use strict';
/*
 repair-capacitor.js — one-off repair for capacitor.html.

 Damage: the h4-deepening pass inserted a premature </section> into chapter 1
 and three more stray closers, duplicated the 1.3 heading, and split the
 comparison-table code block so only its tail survives (wrapped in a garbled
 1.4 heading). The four original lines are re-quoted from the clean backup.

   node repair-capacitor.js [--write]

 Every edit asserts the exact bytes it expects first; the run refuses to write
 unless the section open/close counts end balanced and the h2 count is unchanged.
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = 'capacitor.html';
const abs = path.join(ROOT, FILE);
const src = fs.readFileSync(abs, 'utf8');
const lines = src.split('\n');
const write = process.argv.includes('--write');

// 1-based line -> exact trimmed content we expect
const expect = {
  204: '</section>',
  262: '</section>',
  338: '</section>',
  462: '</section>',
};
for (const [ln, want] of Object.entries(expect)) {
  const got = (lines[+ln - 1] || '').trim();
  if (got !== want) { console.error('refuse: line ' + ln + ' is ' + JSON.stringify(got) + ', expected ' + JSON.stringify(want)); process.exit(2); }
}
if (!(lines[263 - 1] || '').includes('id="ch1-compare" data-toc>1.3') || !(lines[263 - 1] || '').includes('</h3> id=')) {
  console.error('refuse: line 263 is not the garbled 1.3 duplicate');
  process.exit(3);
}
if (!(lines[340 - 1] || '').includes('id="ch1-limits" data-toc>1.4') || !(lines[340 - 1] || '').includes('</h3>tter')) {
  console.error('refuse: line 340 is not the garbled 1.4 heading');
  process.exit(4);
}
if (!(lines[347 - 1] || '').trim().endsWith('</code></pre></div>')) {
  console.error('refuse: line 347 does not close the orphaned code block');
  process.exit(5);
}

const TABLE = [
  '    <div class="codeWrap"><pre><code>                 Your UI is        Native code you',
  '                  --------------    ------------------',
  'Capacitor      web (HTML/CSS/JS) Kotlin / Swift, optional, on demand',
  'Cordova        web (HTML/CSS/JS) Java / ObjC, plugin-based (largely legacy)',
  'React Native   real native views  Kotlin / Swift, per component',
  'Flutter        Skia-drawn        Dart, compiled ahead of time',
  '',
  'Cold start      fastest           medium            slowest to build, fast to run',
  'Bundle size     smallest          medium            large (engine included)',
  'Long lists      fine              fine              excellent (own pipeline)',
  'Animations      good              good              best',
  'New OS features  immediate        immediate         wait for framework support',
  'Team skills     web only          web + some native web + Dart, or native</code></pre></div>',
].join('\n');

const del = new Set([204, 262, 263, 338, 462]);
const out = [];
for (let i = 0; i < lines.length; i++) {
  const ln = i + 1;
  if (ln >= 340 && ln <= 347) { if (ln === 340) out.push(TABLE); continue; }
  if (del.has(ln)) continue;
  out.push(lines[i]);
}
const next = out.join('\n');

const mainOf = (t) => t.slice(t.indexOf('<main id="content">'), t.lastIndexOf('</main>'));
const opens = (t) => (mainOf(t).match(/<section class="chapter">/g) || []).length;
const closes = (t) => (mainOf(t).match(/<\/section>/g) || []).length;
const h2 = (t) => (mainOf(t).match(/<h2[ >]/g) || []).length;

console.log(FILE + ': opens ' + opens(src) + ' -> ' + opens(next) + ' | closes ' + closes(src) + ' -> ' + closes(next) + ' | h2 ' + h2(src) + ' -> ' + h2(next));
console.log('  removed lines 204,262,263,338,462 and rebuilt the table at 340-347');
if (opens(next) !== closes(next)) { console.error('refuse: sections still unbalanced'); process.exit(6); }
if (h2(next) !== h2(src)) { console.error('refuse: h2 count changed'); process.exit(7); }

if (!write) { console.log('(dry run)'); process.exit(0); }
const bak = path.join(ROOT, 'build', 'bak', 'capacitor');
fs.mkdirSync(bak, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(bak, 'capacitor.' + stamp + '.html'), src);
fs.writeFileSync(abs, next);
console.log('  wrote ' + FILE + ' (backup in build/bak/capacitor/)');
