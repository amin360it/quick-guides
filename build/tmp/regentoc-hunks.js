'use strict';
/* Show all diff hunks between a file and its regentoc output. */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const regentoc = path.join(__dirname, 'regentoc.js');

for (const t of process.argv.slice(2)) {
  const tmp = path.join(os.tmpdir(), 'regentoc-hunks-' + t);
  fs.copyFileSync(path.join(ROOT, t), tmp);
  execFileSync(process.execPath, [regentoc, tmp, '--write']);
  const b = fs.readFileSync(path.join(ROOT, t), 'utf8').split('\n');
  const n = fs.readFileSync(tmp, 'utf8').split('\n');
  fs.unlinkSync(tmp);
  console.log('== ' + t);
  const i = Math.max(b.length, n.length);
  let hunk = [];
  for (let x = 0; x < i; x++) {
    const bl = b[x] === undefined ? '<EOF>' : b[x];
    const nl = n[x] === undefined ? '<EOF>' : n[x];
    if (bl !== nl) {
      hunk.push(x + 1);
      if (hunk.length <= 6) {
        console.log('  L' + (x + 1) + ' OLD: ' + bl.slice(0, 140));
        console.log('  L' + (x + 1) + ' NEW: ' + nl.slice(0, 140));
      }
    }
  }
  if (hunk.length > 6) console.log('  ... (' + (hunk.length - 6) + ' more differing lines)');
}