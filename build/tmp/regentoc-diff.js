'use strict';
/* Diff the current file against what regentoc.js WOULD write, per page. */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const regentoc = path.join(__dirname, 'regentoc.js');

for (const t of process.argv.slice(2)) {
  const tmp = path.join(os.tmpdir(), 'regentoc-check-' + t);
  fs.copyFileSync(path.join(ROOT, t), tmp);
  execFileSync(process.execPath, [regentoc, tmp, '--write']);
  const newText = fs.readFileSync(tmp, 'utf8');
  fs.unlinkSync(tmp);
  const before = fs.readFileSync(path.join(ROOT, t), 'utf8');
  if (before === newText) { console.log(t + ': identical'); continue; }
  const a = before.split('\n'); const b = newText.split('\n');
  console.log(t + ': differs (' + a.length + ' -> ' + b.length + ' lines)');
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  console.log('  first diff at line ' + (i + 1));
  if (i < a.length) console.log('  OLD: ' + a[i].slice(0, 160));
  if (i < b.length) console.log('  NEW: ' + b[i].slice(0, 160));
  // count only structural differences: show how many heading ids in each
  const ids = (x) => (x.match(/<h[23] id="/g) || []).length;
  const cap = (x) => (x.match(/<section class="chapter">/g) || []).length;
  console.log('  OLD h2/h3=' + ids(before) + ' chapters=' + cap(before) +
              ' | NEW h2/h3=' + ids(newText) + ' chapters=' + cap(newText));
}