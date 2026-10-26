'use strict';
/* audit expansion fragment: mirrors verify-guide.js code-block rules + structure */
const fs = require('fs');
const s = fs.readFileSync('build/tmp/expansion/r-programming.txt', 'utf8');
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// structure
ok(/^<section class="chapter">/.test(s), 'must start with <section class="chapter">');
ok(/<\/section>$/.test(s.trim()), 'must end with </section>');
const chOpen = (s.match(/<section class="chapter">/g) || []).length;
const chClose = (s.match(/<\/section>/g) || []).length;
ok(chOpen === chClose && chOpen === 7, 'exactly 7 chapters (' + chOpen + '/' + chClose + ')');

// headings
const ids = [...s.matchAll(/<h[234] id="([^"]+)"/g)].map(m => m[1]);
const seen = new Set();
for (const id of ids) { ok(!seen.has(id), 'duplicate id: ' + id); seen.add(id); }
const h2s = [...s.matchAll(/<h2 id="(ch\d+)" data-toc>([\s\S]*?)<\/h2>/g)];
ok(h2s.length === 7, 'h2 count ' + h2s.length);
for (const h of h2s) {
  const n = +h[1].slice(2);
  ok(n >= 1 && n <= 7, 'h2 id out of range: ' + h[1]);
  ok(new RegExp('^' + n + ' ▸ ').test(h[2]), 'h2 title must start "N ▸ ": ' + h[2].slice(0, 30));
  ok(s.includes('<div class="ch-toc"></div></div>'), 'ch-toc placeholder present per chapter');
}
const h3s = [...s.matchAll(/<h3 id="(ch\d+-\d+)" data-toc>([\s\S]*?)<\/h3>/g)];
const h3map = {};
for (const h of h3s) {
  const [, id, text] = h;
  const m = /^(\d+)\.(\d+) /.exec(text);
  ok(m, 'h3 must start "N.M ": ' + text.slice(0, 20));
  if (m) { ok(id === 'ch' + m[1] + '-' + m[2], 'h3 id/number mismatch: ' + id + ' vs ' + text); }
  const c = 'ch' + m?.[1];
  h3map[c] = (h3map[c] || 0) + 1;
}
for (let n = 1; n <= 7; n++) {
  const c = h3map['ch' + n] || 0;
  ok(c >= 3 && c <= 5, 'chapter ch' + n + ' has ' + c + ' h3 (want 3-5)');
}
console.log('h2:', h2s.length, '| h3:', h3s.length, '| h4:', (s.match(/<h4 id="ch/g) || []).length);

// per-h3: has >=1 code block; per-h4: has >=1 code block; h4 count per h3 2-4
const chRe = /<h3 id="([^"]+)"[\s\S]*?(?=<h3 id=|$)/g;
let mm, h4bad = 0, blockless = 0;
const blocks = [...s.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)].map(m => m[1]);
const textAfter = (from) => s.slice(from);
const pos = [...s.matchAll(/<h3 id=/g)].map(m => m.index);
for (let i = 0; i < h3s.length; i++) {
  const start = pos[i];
  const end = i + 1 < pos.length ? pos[i + 1] : s.length;
  const chunk = s.slice(start, end);
  const nBlocks = (chunk.match(/<div class="codeWrap">/g) || []).length;
  if (nBlocks < 1) { blockless++; fails.push('h3 ' + h3s[i][1] + ' has no code block'); }
  const h4s = [...chunk.matchAll(/<h4 id="[^"]+">[\s\S]*?(?=<h4 id=|<h3 id=|$)/g)];
  ok(h4s.length >= 2 && h4s.length <= 4, 'h3 ' + h3s[i][1] + ' has ' + h4s.length + ' h4 (want 2-4)');
  for (const h4 of h4s) {
    if (!/<div class="codeWrap">/.test(h4[0])) { h4bad++; fails.push('h4 without code block inside ' + h3s[i][1] + ': ' + h4[0].slice(0, 60)); }
  }
}
console.log('h4s with no block:', h4bad, '| h3s with no block:', blockless, '| total code blocks:', blocks.length);

// code block rules
let rawLt = 0, bareAmp = 0, dbl = 0, reps = 0;
for (let i = 0; i < blocks.length; i++) {
  const raw = blocks[i];
  const lt = raw.indexOf('<');
  if (lt >= 0) { rawLt++; fails.push('block ' + i + ' raw <: ' + raw.slice(Math.max(0, lt - 25), lt + 25).replace(/\s+/g, ' ')); }
  const badAmp = raw.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;|#x[\da-fA-F]+;)/);
  if (badAmp) { bareAmp++; fails.push('block ' + i + ' bare &: ' + raw.slice(Math.max(0, badAmp.index - 20), badAmp.index + 20).replace(/\s+/g, ' ')); }
  if (/&amp;(amp|lt|gt|quot);/.test(raw)) { dbl++; fails.push('block ' + i + ' double-escape'); }
  const t = raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
  const probe = t.slice(0, 200);
  if (probe.length > 40) {
    const idx = t.indexOf(probe, 1);
    if (idx > 0 && idx + probe.length <= t.length) { reps++; fails.push('block ' + i + ' duplicated copy'); }
  }
}
console.log('raw <:', rawLt, '| bare &:', bareAmp, '| double-esc:', dbl, '| repeats:', reps);

// every h4 has an id and no stray double-escaped entity in prose (sanity)
if (s.includes('&amp;amp;')) fails.push('found &amp;amp;');
// ensure &nbsp / &middot not accidentally needed; count stray &#? none expected
console.log(fails.length ? 'FAILURES ' + fails.length : 'ALL CHECKS PASS');
if (fails.length) console.log(fails.slice(0, 30).join('\n'));
process.exit(fails.length ? 1 : 0);