const fs = require('fs');
const src = fs.readFileSync('package-publishing.html', 'utf8');
const roi = src.slice(src.indexOf('<h2 id="ch5"'), src.indexOf('<h2 id="ch9"'));
const ids = [...roi.matchAll(/<h4 id="([^"]+)"/g)].map(m => m[1]);
console.log('total h4 ids in ch5-ch8:', ids.length);
for (const ch of ['ch5', 'ch6', 'ch7', 'ch8']) {
  const own = ids.filter(i => i.startsWith(ch + '-'));
  console.log(ch, own.length, own.join(' '));
}
// per-section h4: show which h3 lack coverage
const secRe = /<h3 id="([^"]+)"[\s\S]*?(?=<h3 id|<\/section>)/g;
let m;
const secs = [];
while ((m = secRe.exec(roi)) !== null) {
  const h4 = (m[0].match(/<h4 /g) || []).length;
  secs.push([m[1], h4]);
}
console.log('sections:', secs.length, 'with <2 h4:', secs.filter(s => s[1] < 2).map(s => s[0]));