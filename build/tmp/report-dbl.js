'use strict';
/* report-dbl.js <files...>  - show double-escaped entities with context */
const fs = require('fs');
const OPEN = '<div class="codeWrap"><pre><code>';
const RE = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8');
  let m, i = 0;
  while ((m = RE.exec(s))) {
    const raw = m[1];
    const re = /&amp;(amp|lt|gt|quot);/g;
    let b;
    while ((b = re.exec(raw))) {
      const a = Math.max(0, b.index - 50), z = Math.min(raw.length, b.index + 60);
      console.log('--- ' + f + ' block#' + i + ' offset ' + b.index);
      console.log(raw.slice(a, z).replace(/\s+/g, ' '));
    }
    i++;
  }
}
