'use strict';
// Inspect every duplicate element id in a file: how many, and 70 chars around each.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const f = process.argv[2];
const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => ({ id: m[1], at: m.index }));
const counts = new Map();
for (const { id } of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, n] of counts) {
  if (n < 2) continue;
  console.log('### id="' + id + '" x' + n);
  for (const occ of ids.filter((x) => x.id === id)) {
    const a = Math.max(0, occ.at - 60), b = Math.min(s.length, occ.at + 70);
    console.log('  @' + occ.at + ' …' + s.slice(a, b).replace(/\n/g, '⏎') + '…');
  }
}
