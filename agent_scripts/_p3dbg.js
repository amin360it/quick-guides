const fs = require('fs');
const NOT_HEADING = '(?:(?!</?h\\d)[\\s\\S])*?';
const P3 = new RegExp(`<h4\\b([^>]*)>(${NOT_HEADING})<\\/(h[1-6])>`, 'g');
const s = fs.readFileSync(process.argv[2] || 'csharp.html', 'utf8');
let m;
let shown = 0;
while ((m = P3.exec(s)) !== null) {
  if (m[3] === '4') continue;
  if (shown++ >= 8) break;
  const line = s.slice(0, m.index).split('\n').length;
  console.log(`--- line ${line}  close=</h${m[3]}>`);
  console.log(JSON.stringify(m[0].slice(0, 160)));
  console.log();
}
console.log('shown', shown, 'differing-close matches');
