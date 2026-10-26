'use strict';
/* checkfrags.js — validate authored fragments exist and have the right shape. */
const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
  const p = 'build/tmp/expansion/' + f + '.txt';
  if (!fs.existsSync(p)) { console.log(f + ': MISSING'); continue; }
  const s = fs.readFileSync(p, 'utf8');
  const ch = (s.match(/<section class="chapter">/g) || []).length;
  const h3 = (s.match(/<h3 id=/g) || []).length;
  const code = (s.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const start = s.trimStart().startsWith('<section class="chapter">');
  const end = s.trimEnd().endsWith('</section>');
  const h2s = (s.match(/<h2 id=/g) || []).length;
  const placeholders = (s.match(/<div class="ch-toc"><\/div><\/div>/g) || []).length;
  console.log(f + ': ch=' + ch + ' h2=' + h2s + ' h3=' + h3 + ' code=' + code +
    ' placeholder=' + placeholders + ' start=' + start + ' end=' + end +
    ' KB=' + Math.round(Buffer.byteLength(s) / 1024));
}