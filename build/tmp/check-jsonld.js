/* Verify every page's JSON-LD script block parses. A broken one leaks raw JSON
   into the visible page ("JSON instead of code"). */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let pages = 0, blocks = 0, bad = [];

for (const f of files.sort()) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m, hasAny = false;
  while ((m = re.exec(s))) {
    hasAny = true; blocks++;
    const inner = m[1];
    if (inner.includes('\uFFFD')) { bad.push([f, 'U+FFFD replacement char in JSON-LD', m.index]); continue; }
    try { JSON.parse(inner); }
    catch (e) { bad.push([f, 'JSON.parse failed: ' + e.message, m.index]); }
  }
  if (!hasAny) bad.push([f, 'NO json-ld block found', -1]);
  pages++;
}
console.log('pages:', pages, 'json-ld blocks:', blocks, 'problems:', bad.length);
for (const [f, msg, idx] of bad) {
  console.log('  ' + f + ' :: ' + msg + (idx >= 0 ? ' @' + idx : ''));
}