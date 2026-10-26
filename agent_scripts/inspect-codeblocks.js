'use strict';
// For each code block, report whether its body contains a literal block
// delimiter of its own (which breaks regex-based boundary detection).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0, bad = 0;
while ((m = codeRe.exec(s))) {
  i++;
  const body = m[1];
  const hasOpen = body.includes('<div class="codeWrap">');
  const hasPre = body.includes('<pre><code>');
  const hasClose = body.includes('</code></pre></div>');
  if (hasOpen || hasPre || hasClose) {
    bad++;
    const line = s.slice(0, m.index).split('\n').length;
    console.log('block #' + i + ' at line ' + line + ' : open=' + hasOpen + ' pre=' + hasPre + ' close=' + hasClose);
    console.log('   first 160: ' + JSON.stringify(body.slice(0, 160)));
  }
}
console.log('blocks ' + i + ' | with embedded delimiters ' + bad);
