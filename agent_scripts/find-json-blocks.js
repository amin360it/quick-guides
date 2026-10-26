'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\b/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let totalFiles = 0, totalBlocks = 0, jsonBlocks = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  let m;
  while ((m = codeRe.exec(s))) {
    totalBlocks++;
    const body = m[1];
    if (body.includes('{') && body.includes('}')) {
      const trimmed = body.trim();
      const hasKeyValue = /".*":\s*".*"/.test(body);
      const hasNumeric = /^\d+:\s*/.test(body) || /:\d+,\s*\d+/.test(body);
      if (hasKeyValue || hasNumeric) {
        jsonBlocks++;
        const line = s.slice(0, m.index).split('\n').length;
        const fname = f;
        console.log(fname + ':' + line + ' json-block');
        console.log('  body: ' + body.slice(0, 120).replace(/\n/g, ' '));
      }
    }
  }
  totalFiles++;
}
console.log('total files: ' + totalFiles + ', blocks: ' + totalBlocks + ', json blocks: ' + jsonBlocks);