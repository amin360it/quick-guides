'use strict';
// Print the exact text between the first and second occurrence of each duplicate id.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => ({ id: m[1], at: m.index }));
const counts = new Map();
for (const { id } of ids) counts.set(id, (counts.get(id) || 0) + 1);
for (const [id, n] of counts) {
  if (n < 2) continue;
  const occ = ids.filter((x) => x.id === id);
  console.log('### ' + id + ' x' + n);
  for (let i = 1; i < occ.length; i++) {
    const between = s.slice(occ[i - 1].at, occ[i].at);
    console.log('  first->second (' + between.length + ' chars):');
    console.log('  ┌' + between.replace(/\n/g, '⏎') + '┐');
  }
  console.log('');
}
