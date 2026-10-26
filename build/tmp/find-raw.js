'use strict';
const fs = require('fs');
const s = fs.readFileSync('linux-shell.html', 'utf8');
const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0;
while ((m = blockRe.exec(s))) {
  const raw = m[1];
  const off = [];
  for (let x = 0; x < raw.length; x++) {
    const c = raw[x];
    if (c === '<' || c === '>' || c === '&') off.push(c + '@' + x);
  }
  if (off.length) console.log('block ' + i + ' raw chars:', off.slice(0, 12).join(' '), '| context:', JSON.stringify(raw.slice(Math.max(0, +off[0].split('@')[1] - 30), +off[0].split('@')[1] + 30)));
  i++;
}