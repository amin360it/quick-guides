'use strict';
/* find-href.js <file> <needle> - show <a href> and <img src> context */
const fs = require('fs');
const f = process.argv[2];
const needle = process.argv[3];
const s = fs.readFileSync(f, 'utf8');
const re = new RegExp('(?:href|src)="' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"', 'g');
let m, n = 0;
while ((m = re.exec(s))) {
  n++;
  const a = Math.max(0, m.index - 160);
  console.log('--- occurrence ' + n + ' at ' + m.index);
  console.log(s.slice(a, m.index + 60).replace(/\n/g, ' '));
  console.log('');
}
if (!n) console.log('none');
