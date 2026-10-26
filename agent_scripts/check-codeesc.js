'use strict';
/*
 check-codeesc.js — find code samples that contain a raw (unescaped) HTML tag.

 The library's rule: inside <div class="codeWrap"><pre><code>...</code></pre></div>
 every `<` must be written `&lt;` and every `&` `&amp;`. A raw `<` followed by a
 letter, `/` or `!` is therefore a defect — the browser will parse it as markup.

   node check-codeesc.js [file.html ...]        (default: every guide on disk)
   node check-codeesc.js --all
 Exit code 1 when any defect is found.
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\b/;

let files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!files.length) {
  files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
}

const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let totalDefects = 0, totalDouble = 0, totalBlocks = 0, totalErr = 0;
for (const f of files) {
  const abs = path.isAbsolute(f) ? f : path.join(ROOT, f);
  if (!fs.existsSync(abs)) { console.log(f + ' :: MISSING'); continue; }
  const s = fs.readFileSync(abs, 'utf8');
  let m; const hits = [];
  let dbl = 0, nblocks = 0, errn = 0;
  while ((m = codeRe.exec(s))) {
    nblocks++;
    const body = m[1];
    // `&amp;amp;` is always an error; the other double escapes are warnings
    // (a sample demonstrating escaped output writes them doubly).
    const errs = body.match(/&amp;amp;/g) || [];
    errn += errs.length;
    dbl += (body.match(/&amp;(lt|gt|quot|middot|nbsp);/g) || []).length;
    // raw tag-like `<`
    const re = /<(?=[a-zA-Z/!])/g;
    let t;
    while ((t = re.exec(body))) {
      const around = body.slice(Math.max(0, t.index - 28), t.index + 28).replace(/\n/g, '\\n');
      hits.push(around);
    }
  }
  totalBlocks += nblocks;
  totalDouble += dbl;
  totalErr += errn;
  if (hits.length || dbl || errn) {
    totalDefects += hits.length + errn;
    console.log('===== ' + f + ' : ' + hits.length + ' raw-tag `<` in ' + nblocks + ' blocks, ' +
      errn + ' error double-escapes, ' + dbl + ' warnings =====');
    hits.slice(0, 12).forEach((h) => console.log('   ' + h));
    if (hits.length > 12) console.log('   ... +' + (hits.length - 12) + ' more');
  }
}
console.log('\nscanned ' + files.length + ' files, ' + totalBlocks + ' code blocks');
console.log('raw-tag `<` defects: ' + totalDefects + ' | error double-escapes: ' + totalErr + ' | warnings: ' + totalDouble);
process.exit(totalDefects ? 1 : 0);
