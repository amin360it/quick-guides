const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');

const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0;
const interest = new Set([138, 179, 182, 196, 197, 217, 219, 261, 263]);
const offenders = [];

while ((m = codeRe.exec(html))) {
  i++;
  if (!interest.has(i)) continue;
  const code = m[1];
  const problems = [];
  if (/&amp;(amp|lt|gt|quot|#)/.test(code)) problems.push('double-escape');
  if (/<(?![\/a-zA-Z!])/.test(code)) problems.push('raw <');
  const badAmp = code.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;)/g);
  if (badAmp) problems.push(`bare & (${badAmp.length})`);
  if (!problems.length) continue;
  // find the enclosing h3
  const before = html.slice(0, m.index);
  const h3s = [...before.matchAll(/<h[23] id="([^"]+)"/g)];
  const h3 = h3s.length ? h3s[h3s.length - 1][1] : '(before any heading)';
  const snippet = code.slice(0, 220).replace(/\n/g, '\\n');
  offenders.push({ idx: i, h3, problems, snippet });
}
for (const o of offenders) {
  console.log(`block #${o.idx} in [${o.h3}]  ${o.problems.join(', ')}`);
  console.log('  ' + o.snippet);
}