'use strict';
/* count-dbl.js - classify double-escaped entities across guides */
const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('.').filter(f => /\.html$/.test(f) && !/^(index|topics|search|favorites|test)/.test(f)).sort();
const OPEN = '<div class="codeWrap"><pre><code>';
const RE = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
const ERROR = /&amp;amp;/g;                    // always an error per AGENTS.md
const WARN = /&amp;(lt|gt|quot|nbsp|middot);/g; // warning: may demonstrate escaping
let te = 0, tw = 0, perFile = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  let m, e = 0, w = 0;
  while ((m = RE.exec(s))) {
    e += (m[1].match(ERROR) || []).length;
    w += (m[1].match(WARN) || []).length;
  }
  if (e || w) { te += e; tw += w; perFile.push(f + ': ' + e + ' err / ' + w + ' warn'); }
}
perFile.forEach(x => console.log('  ' + x));
console.log('TOTAL errors=' + te + ' warnings=' + tw + ' across ' + perFile.length + ' files');
