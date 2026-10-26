'use strict';
/*
 fix-navopen.js — ensure every top-level <li class="chapter"> in the sidebar
 <nav id="toc"> carries the `open` class, matching the rest of the library.

   node fix-navopen.js <file.html> [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
if (!positional.length) { console.log('usage: node fix-navopen.js <file.html> [--write]'); process.exit(1); }

for (const f of positional) {
  const abs = path.join(ROOT, f);
  const s = fs.readFileSync(abs, 'utf8');
  const start = s.indexOf('<nav id="toc"');
  const end = s.indexOf('</nav>', start);
  if (start < 0 || end < 0) { console.error(f + ': no nav#toc'); continue; }
  const nav = s.slice(start, end);
  const before = (nav.match(/class="chapter open"/g) || []).length;
  const plain = (nav.match(/class="chapter"/g) || []).length;
  const nav2 = nav.replace(/class="chapter"/g, 'class="chapter open"');
  const after = (nav2.match(/class="chapter open"/g) || []).length;
  console.log(f + ': open ' + before + ' -> ' + after + ' (added ' + plain + ')');
  if (!plain) continue;
  if (!write) continue;
  const out = s.slice(0, start) + nav2 + s.slice(end);
  fs.writeFileSync(abs, out);
  console.log('  wrote ' + f);
}
