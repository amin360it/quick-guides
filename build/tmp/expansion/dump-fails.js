const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');

const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0;
const targets = [138, 179, 182, 196, 197, 217, 219, 261, 263];
const found = [];

while ((m = codeRe.exec(html))) {
  i++;
  if (!targets.includes(i)) continue;
  const before = html.slice(0, m.index);
  const h3s = [...before.matchAll(/<h[23] id="([^"]+)"/g)];
  const h3 = h3s.length ? h3s[h3s.length - 1][1] : '(no heading)';
  found.push(`#${i} [${h3}]: ${m[1].slice(0, 160).replace(/\n/g, '\\n')}`);
}
console.log('total blocks scanned:', i);
console.log(found.join('\n') || 'none found');