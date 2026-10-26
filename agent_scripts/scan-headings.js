// Scan every guide for headings closed by the wrong tag (e.g. <h3>...</h4>).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

let total = 0;
const perFile = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h([1-6])>/g;
  let m;
  const bad = [];
  while ((m = re.exec(s)) !== null) {
    if (m[1] !== m[3]) {
      const line = s.slice(0, m.index).split('\n').length;
      bad.push({ line, open: m[1], close: m[3], text: m[2].replace(/<[^>]+>/g, '').slice(0, 60) });
    }
  }
  if (bad.length) {
    perFile.push({ f, bad });
    total += bad.length;
  }
}
if (!total) console.log('No mismatched heading closes found.');
else {
  console.log(`Mismatched heading closes: ${total}\n`);
  for (const { f, bad } of perFile) {
    console.log(`${f}  (${bad.length})`);
    for (const b of bad) console.log(`   line ${b.line}: <h${b.open}>…</h${b.close}>  "${b.text}"`);
  }
}
