'use strict';
const fs = require('fs');
const s = fs.readFileSync('build/newguides/virtualization.main.html', 'utf8');
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m;
let cnt = 0;
while ((m = codeRe.exec(s))) {
  cnt++;
  if (cnt === 71) {
    console.log('=== BLOCK 71 ===');
    console.log('Full text length: ' + m[0].length);
    console.log('Body length: ' + m[1].length);
    console.log('Body first 300: ' + m[1].slice(0, 300).replace(/\n/g, ' '));
    console.log('Raw < count in body: ' + (body.match(/<(?=[a-zA-Z!])/g) || []).length);
    // Show lines around this block
    const lines = s.split('\n');
    const startLine = Math.max(0, Math.floor(m.index / 100) * 100);
    const endLine = Math.min(s.split('\n').length, startLine + 50);
    for (let i = startLine; i < endLine; i++) {
      console.log((i+1) + ': ' + lines[i].slice(0, 120));
    }
    break;
  }
}
"