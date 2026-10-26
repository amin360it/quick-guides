const fs = require('fs');
const h = fs.readFileSync('api-design.html', 'utf8');
const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
const flags = new Set([138, 164, 185, 188, 203, 223, 269]);
let m, i = 0;
while ((m = re.exec(h))) {
  i++;
  if (!flags.has(i)) continue;
  const code = m[1];
  const raw = code.match(/<(?![\/a-zA-Z!])/);
  const bad = code.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;)/g);
  const dbl = code.match(/&amp;(amp|lt|gt|quot|#)/);
  console.log('--- block', i, '---');
  console.log('  first:', JSON.stringify(code.split('\n')[0].slice(0, 100)));
  if (raw) console.log('  raw< at', raw.index, JSON.stringify(code.slice(Math.max(0, raw.index - 40), raw.index + 20)));
  if (bad) console.log('  bare& count', bad.length, JSON.stringify(code.slice(0, 80)));
  if (dbl) console.log('  double-escape at', dbl.index, JSON.stringify(code.slice(Math.max(0, dbl.index - 40), dbl.index + 20)));
}
