const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test|searchindex)\b/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
let h4 = 0, mb = 0;
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  h4 += (s.match(/<h4[ >]/g) || []).length;
  mb += fs.statSync(path.join(ROOT, f)).size;
}
const px = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
console.log('h4 (sub-headings):', px(String(h4)));
console.log('total MB:', (mb / 1024 / 1024).toFixed(1));
