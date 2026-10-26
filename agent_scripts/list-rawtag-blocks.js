'use strict';
// List code blocks that contain a raw tag-like `<`, with line numbers.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const only = process.argv[3] ? Number(process.argv[3]) : 0; // section index filter (1-based)
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0, shown = 0;
while ((m = codeRe.exec(s))) {
  const body = m[1];
  const raw = (body.match(/<(?=[a-zA-Z/!])/g) || []).length;
  if (!raw) continue;
  const line = s.slice(0, m.index).split('\n').length;
  const secAt = s.lastIndexOf('<section class="chapter">', m.index);
  const secNo = (s.slice(0, secAt).match(/<section class="chapter">/g) || []).length + 1;
  if (only && secNo !== only) continue;
  shown++;
  console.log('sec ' + secNo + ' | line ' + line + ' | raw=' + raw);
  console.log('   ' + JSON.stringify(body.slice(0, 180)));
}
console.log('blocks with raw tags shown: ' + shown);
