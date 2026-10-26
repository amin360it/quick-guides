const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test)\.html$/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();
let totalH4Toc = 0;
let referenced = 0;
const perFile = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const h4toc = (s.match(/<h4\b[^>]*\bdata-toc\b[^>]*>/g) || []).length;
  if (!h4toc) continue;
  // collect the ids of those h4s
  const ids = [];
  const re = /<h4\b([^>]*\bdata-toc\b[^>]*)>/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const id = (m[1].match(/id="([^"]+)"/) || [])[1];
    if (id) ids.push(id);
  }
  // is any of those ids used as an anchor target anywhere?
  const used = ids.filter((id) => s.includes(`href="#${id}"`));
  totalH4Toc += h4toc;
  referenced += used.length;
  perFile.push({ f, h4toc, used: used.length });
}
perFile.sort((a, b) => b.h4toc - a.h4toc);
for (const x of perFile) console.log(x.f.padEnd(26), 'h4[data-toc]=', String(x.h4toc).padStart(4), x.used ? `REFERENCED ${x.used}` : '');
console.log('\ntotal h4 with data-toc:', totalH4Toc, '| referenced by any href:', referenced);
