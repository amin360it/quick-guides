'use strict';
/*
 fix-codeesc.js — escape raw `<` and bare `&` inside code samples.

 The library's rule: inside <div class="codeWrap"><pre><code>...</code></pre></div>
 every `<` is written `&lt;` and every bare `&` `&amp;`. A raw `<` followed by a
 letter, `/` or `!` is a defect: the browser parses it as markup and the sample
 is destroyed.

 This tool only ever GROWS a file. It never touches `&amp;lt;` / `&amp;amp;`
 (those are a separate, deliberate question), never creates one, and refuses to
 write unless the code-block count is unchanged and no entity was double-escaped.

   node fix-codeesc.js [file.html ...] [--write]     (default: every guide)
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\b/;
const write = process.argv.includes('--write');

let files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!files.length) files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

const CODE = '<div class="codeWrap"><pre><code>';
const CLOSE = '</code></pre></div>';
// escape `&` only when it does not already open an entity; then every `<`
const escBody = (b) => b
  .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
  .replace(/</g, '&lt;');
const count = (t, re) => (t.match(re) || []).length;

let totalFiles = 0, totalBlocks = 0, totalChanged = 0;
const bak = path.join(ROOT, 'build', 'bak', 'codeesc');
if (write) fs.mkdirSync(bak, { recursive: true });

for (const f of files) {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) { console.log(f + ' :: MISSING'); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let blocks = 0, changed = 0;
  const out = src.replace(codeRe, (_w, body) => {
    blocks++;
    const e = escBody(body);
    if (e !== body) changed++;
    return CODE + e + CLOSE;
  });
  totalFiles++; totalBlocks += blocks; totalChanged += changed;
  if (!changed) continue;
  const bad = count(out, /&amp;(amp|lt|gt|quot|middot|nbsp);/g);
  const badBefore = count(src, /&amp;(amp|lt|gt|quot|middot|nbsp);/g);
  console.log(f + ': ' + changed + '/' + blocks + ' blocks escaped | bytes ' + src.length + ' -> ' + out.length + ' | double ' + badBefore + ' -> ' + bad);
  if (out.length < src.length) { console.error('refuse: ' + f + ' shrank'); process.exit(2); }
  if (bad !== badBefore) { console.error('refuse: ' + f + ' changed double-escape count'); process.exit(3); }
  if (count(out, /<div class="codeWrap">/g) !== count(src, /<div class="codeWrap">/g)) { console.error('refuse: ' + f + ' block count changed'); process.exit(4); }
  if (!write) continue;
  const bakPath = path.join(bak, f);
  fs.mkdirSync(path.dirname(bakPath), { recursive: true });
  fs.writeFileSync(bakPath, src);
  fs.writeFileSync(abs, out);
}
console.log('scanned ' + totalFiles + ' files, ' + totalBlocks + ' blocks, changed ' + totalChanged + (write ? ' (written)' : ' (dry run)'));
