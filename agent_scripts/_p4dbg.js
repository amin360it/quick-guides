const fs = require('fs');
const NOT_HEADING = '(?:(?!</?h\\d)[\\s\\S])*?';
const P4 = new RegExp(`<h4\\b([^>]*)>(${NOT_HEADING})<\\/p>`, 'g');
const s = fs.readFileSync(process.argv[2] || 'package-publishing.html', 'utf8');
let m;
let i = 0;
while ((m = P4.exec(s)) !== null) {
  i++;
  const line = s.slice(0, m.index).split('\n').length;
  console.log(`=== P4 #${i}  line ${line}`);
  console.log('MATCH   :', JSON.stringify(m[0].slice(0, 200)));
  console.log('REPLACE :', JSON.stringify((`<h4${m[1]}>${m[2]}</h4>`).slice(0, 200)));
  console.log('CONTEXT :', JSON.stringify(s.slice(Math.max(0, m.index - 60), m.index + 160)));
  console.log();
}
console.log('total P4 matches:', i);
