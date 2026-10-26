'use strict';
/* ctx-block.js <file> <blockIndex> [charsBefore] [charsAfter] */
const fs = require('fs');
const f = process.argv[2];
const want = +process.argv[3];
const before = +(process.argv[4] || 1400);
const after = +(process.argv[5] || 600);
const s = fs.readFileSync(f, 'utf8');
const OPEN = '<div class="codeWrap"><pre><code>';
const CLOSE = '</code></pre></div>';
let pos = 0, i = 0;
const re = new RegExp(OPEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
// simpler: use indexOf loop
let idx = -1;
for (;;) {
  const p = s.indexOf(OPEN, pos);
  if (p < 0) break;
  const e = s.indexOf(CLOSE, p + OPEN.length);
  if (i === want) {
    console.log('=== BEFORE ===');
    console.log(s.slice(Math.max(0, p - before), p));
    console.log('=== BLOCK at ' + p + ' ===');
    console.log(s.slice(p, e + CLOSE.length));
    console.log('=== AFTER ===');
    console.log(s.slice(e + CLOSE.length, e + CLOSE.length + after));
    break;
  }
  i++;
  pos = e + CLOSE.length;
}
