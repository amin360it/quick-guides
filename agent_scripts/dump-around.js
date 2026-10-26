'use strict';
// Dump raw text around a given id's first occurrence, newlines shown.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const id = process.argv[3];
const before = Number(process.argv[4] || 40);
const after = Number(process.argv[5] || 900);
let from = 0;
while (true) {
  const at = s.indexOf('id="' + id + '"', from);
  if (at < 0) break;
  console.log('===== @' + at + ' =====');
  console.log(s.slice(Math.max(0, at - before), at + after).replace(/\n/g, '\n·'));
  console.log('');
  from = at + 1;
}
