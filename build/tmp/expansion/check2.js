const fs = require('fs');
const h = fs.readFileSync('api-design.html', 'utf8');

// map char offset -> owning h2 id
const h2s = [];
const h2re = /<h2 id="([^"]+)"[^>]*>/g;
let m;
while ((m = h2re.exec(h))) h2s.push({ id: m[1], at: m.index });
function owner(off) {
  let id = '?';
  for (const x of h2s) if (x.at <= off) id = x.id;
  return id;
}

const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let i = 0, faults = 0;
const byCh = {};
while ((m = re.exec(h))) {
  i++;
  const code = m[1];
  const ch = owner(m.index);
  byCh[ch] = (byCh[ch] || 0) + 1;
  const issues = [];
  const raw = code.match(/<(?![\/a-zA-Z!])/);
  if (raw) issues.push('raw< @' + raw.index + ' ' + JSON.stringify(code.slice(Math.max(0, raw.index - 30), raw.index + 15)));
  const bad = code.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;)/g);
  if (bad) issues.push('bare& x' + bad.length + ' ' + JSON.stringify(code.split('\n')[0].slice(0, 50)));
  const dbl = code.match(/&amp;(amp|lt|gt|quot|#)/);
  if (dbl) issues.push('double-escape @' + dbl.index + ' ' + JSON.stringify(code.slice(Math.max(0, dbl.index - 30), dbl.index + 15)));
  const head = code.slice(0, 200);
  if (head.length >= 20 && code.indexOf(head, 20) !== -1) issues.push('repeat');
  if (issues.length) {
    faults++;
    console.log(`[${ch}] block#${i}: ` + issues.join(' | '));
  }
}
console.log('\nblocks per chapter:', JSON.stringify(byCh));
console.log('total blocks:', i, 'faults:', faults);
