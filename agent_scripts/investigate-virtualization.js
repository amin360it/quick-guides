'use strict';
const fs = require('fs');
const s = fs.readFileSync('build/newguides/virtualization.main.html', 'utf8');
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m;
let count = 0;
while ((m = codeRe.exec(s))) {
  count++;
  const body = m[1];
  const raw = (body.match(/<(?=[a-zA-Z!])/g) || []).length;
  if (raw > 0) {
    console.log('Block ' + count + ': raw=' + raw);
    console.log('  ' + body.slice(0, 100).replace(/\n/g, ' '));
  }
}
console.log('Total blocks: ' + count);