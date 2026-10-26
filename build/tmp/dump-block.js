'use strict';
/* dump-block.js <file> <blockIndex> */
const fs = require('fs');
const f = process.argv[2];
const want = +process.argv[3];
const s = fs.readFileSync(f, 'utf8');
const RE = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0;
while ((m = RE.exec(s))) {
  if (i === want) {
    console.log('=== ' + f + ' block#' + i + ' (len ' + m[1].length + ') ===');
    console.log(m[1]);
    break;
  }
  i++;
}
