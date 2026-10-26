const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
const pairs = ['section', 'div', 'p', 'h2', 'h3', 'h4', 'code', 'pre', 'table', 'tr', 'td', 'th', 'ul', 'li', 'strong', 'em'];
let bad = 0;
for (const t of pairs) {
  const o = (s.match(new RegExp('<' + t + '(?=[ >])', 'g')) || []).length;
  const c = (s.match(new RegExp('</' + t + '>', 'g')) || []).length;
  if (o !== c) { console.log('MISMATCH', t, o, c); bad++; }
}
console.log('tag balance:', bad === 0 ? 'OK' : bad + ' mismatches');
const blocks = [...s.matchAll(/<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g)].map(m => m[1]);
for (const i of [21, 41, 68]) {
  console.log('--- block ' + i + ' ---');
  console.log(blocks[i]);
}
