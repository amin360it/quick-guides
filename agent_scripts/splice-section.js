'use strict';
/*
 splice-section.js — replace whole chapters of a guide with the same chapters
 from another file. Chapters are 1-based <section class="chapter"> blocks.

   node splice-section.js <target.html> <source.html> <i,j,...> [--write]

 Guards: every index is in range in both files, and the target h2 and the source
 h2 must carry the same id (so a chapter cannot be spliced onto a different one).
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const pos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const write = process.argv.includes('--write');
if (pos.length < 3) { console.log('usage: node splice-section.js <target> <source> <i,j> [--write]'); process.exit(1); }
const [target, source, idxArg] = pos;
const want = idxArg.split(',').map(Number);

const secRe = /<section class="chapter">[\s\S]*?<\/section>/g;
function parts(file) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const list = [...s.matchAll(secRe)].map((m) => ({ start: m.index, end: m.index + m[0].length, text: m[0] }));
  return { s, list };
}
const T = parts(target), S = parts(source);
for (const i of want) {
  if (i < 1 || i > T.list.length) { console.error('target has no section ' + i); process.exit(2); }
  if (i < 1 || i > S.list.length) { console.error('source has no section ' + i); process.exit(3); }
  const tid = (T.list[i - 1].text.match(/<h2[^>]*\bid="([^"]+)"/) || [])[1];
  const sid = (S.list[i - 1].text.match(/<h2[^>]*\bid="([^"]+)"/) || [])[1];
  if (!tid || tid !== sid) { console.error('section ' + i + ' id mismatch: target=' + tid + ' source=' + sid); process.exit(4); }
  console.log('section ' + i + ' (' + tid + '): ' + T.list[i - 1].text.length + ' -> ' + S.list[i - 1].text.length + ' chars');
}
let out = T.s;
for (const i of [...want].sort((a, b) => b - a)) {
  out = out.slice(0, T.list[i - 1].start) + S.list[i - 1].text + out.slice(T.list[i - 1].end);
}
console.log(target + ': ' + T.s.length + ' -> ' + out.length + ' bytes');
if (!write) { console.log('(dry run)'); process.exit(0); }
const bak = path.join(ROOT, 'build', 'bak', 'splice');
fs.mkdirSync(bak, { recursive: true });
fs.writeFileSync(path.join(bak, path.basename(target)), T.s);
fs.writeFileSync(path.join(ROOT, target), out);
console.log('wrote ' + target);
