'use strict';
// List every double-escaped entity (&amp;lt; &amp;gt; &amp;amp; &amp;quot; &amp;middot; &amp;nbsp;)
// inside code samples, with file, line and context, so each can be judged.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\b/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
const RE = /&amp;(amp|lt|gt|quot|middot|nbsp);/g;
let total = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
  let m;
  while ((m = codeRe.exec(s))) {
    const body = m[1];
    const hits = [...body.matchAll(RE)];
    if (!hits.length) continue;
    const line = s.slice(0, m.index).split('\n').length;
    for (const h of hits) {
      total++;
      const at = h.index;
      const ctx = body.slice(Math.max(0, at - 60), at + 60).replace(/\n/g, ' ');
      console.log(f + ':' + line + '  &' + h[1] + ';');
      console.log('    …' + ctx + '…');
    }
  }
}
console.log('total double-escaped: ' + total);
