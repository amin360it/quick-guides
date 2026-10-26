'use strict';
// Per-section raw-tag `<` count inside code samples (mirrors check-codeesc.js).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const secRe = /<section class="chapter">[\s\S]*?(?=<section class="chapter">|<\/main>)/g;
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let i = 0, m;
while ((m = secRe.exec(s))) {
  i++;
  const sec = m[0];
  const h2 = ((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '?').replace(/<[^>]+>/g, '').trim();
  let raw = 0, blocks = 0, dbl = 0;
  const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let b;
  while ((b = re.exec(sec))) {
    blocks++;
    const body = b[1];
    dbl += (body.match(/&amp;(amp|lt|gt|quot|middot|nbsp);/g) || []).length;
    raw += (body.match(/<(?=[a-zA-Z/!])/g) || []).length;
  }
  console.log(String(i).padStart(2) + '. ' + h2.slice(0, 44).padEnd(46) + ' blocks=' + String(blocks).padStart(3) + ' rawTag=' + String(raw).padStart(3) + ' double=' + dbl);
}
