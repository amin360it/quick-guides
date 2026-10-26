'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

function walk(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'build' || name === '.git' || name === 'node_modules') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const files = walk(ROOT, []);
const freq = new Map();
const byFile = new Map();

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const seen = new Set();
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F) continue;
    freq.set(cp, (freq.get(cp) || 0) + 1);
    seen.add(cp);
  }
  for (const cp of seen) {
    if (!byFile.has(cp)) byFile.set(cp, []);
    byFile.get(cp).push(path.basename(f));
  }
}

const rows = [...freq.entries()].sort((a, b) => b[1] - a[1]);
console.log('Distinct non-ASCII code points:', rows.length);
for (const [cp, n] of rows) {
  const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
  const label = cp in {} ? '' : '';
  const filesWith = byFile.get(cp);
  console.log(`  ${JSON.stringify(String.fromCodePoint(cp))} ${hex}  x${n}  in ${filesWith.length} file(s): ${filesWith.slice(0,6).join(', ')}${filesWith.length>6?' ...':''}`);
}
