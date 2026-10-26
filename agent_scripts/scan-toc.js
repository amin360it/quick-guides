// Report <h2>/<h3> elements missing data-toc, and code samples that contain a
// second copy of their own opening text (the repeats.js invariant).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

console.log('== h2/h3 without data-toc ==');
let missing = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /<h([23])\b([^>]*)>/g;
  let m;
  const out = [];
  while ((m = re.exec(s)) !== null) {
    if (/\bdata-toc\b/.test(m[2])) continue;
    const line = s.slice(0, m.index).split('\n').length;
    const id = (m[2].match(/id="([^"]+)"/) || [, '?'])[1];
    out.push(`line ${line} h${m[1]} #${id}`);
  }
  if (out.length) { missing += out.length; console.log(`  ${f} (${out.length}): ${out.slice(0, 6).join('; ')}${out.length > 6 ? ' …' : ''}`); }
}
console.log('total:', missing);

console.log('\n== code samples containing a second copy of their own start (repeats.js) ==');
let dupFiles = 0;
let dupBlocks = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let m;
  let count = 0;
  while ((m = re.exec(s)) !== null) {
    const body = m[1];
    if (body.length < 400) continue;
    const head = body.slice(0, 120);
    if (head.trim().length < 30) continue;
    if (body.indexOf(head, 1) !== -1) count++;
  }
  if (count) { dupFiles++; dupBlocks += count; console.log(`  ${f}: ${count} suspicious block(s)`); }
}
console.log(`files: ${dupFiles} | blocks: ${dupBlocks}`);
