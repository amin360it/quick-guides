const fs = require('fs');
const s = fs.readFileSync(process.argv[2] || 'nextjs.html', 'utf8');
const lineOf = (i) => s.slice(0, i).split('\n').length;
function all(re) { const r = new RegExp(re, 'g'); const out = []; let m; while ((m = r.exec(s))) out.push(m.index); return out; }
const opens = all('<div class="codeWrap"><pre><code>');
const closes = all('</code></pre></div>');
console.log('opens', opens.length, 'closes', closes.length);
// pair greedily-ish: for each close, is there an open before it not yet used?
let oi = 0;
for (let ci = 0; ci < closes.length; ci++) {
  if (oi < opens.length && opens[oi] < closes[ci]) { oi++; }
  else {
    console.log('STRAY closer at byte', closes[ci], 'line', lineOf(closes[ci]));
    console.log('  context:', JSON.stringify(s.slice(closes[ci] - 120, closes[ci] + 60)));
  }
}
if (oi < opens.length) console.log('unmatched OPENERS remaining:', opens.length - oi);
