const fs = require('fs');
const path = process.argv[1] === __filename ? process.argv[2] : process.argv[3];
const file = 'nextjs.html';
let s = fs.readFileSync(file, 'utf8');

const mainStart = s.indexOf('<main id="content">');
const mainEnd = s.indexOf('</main>');
if (mainStart < 0 || mainEnd < 0) { console.error('main not found'); process.exit(1); }
const main = s.slice(mainStart, mainEnd);

// split by h3 openings
const parts = main.split(/(?=<h3 id="[^"]+" data-toc>)/).filter(p => p.startsWith('<h3'));
console.log('h3 sections in main:', parts.length);

let fail = 0;
const rows = [];
for (const p of parts) {
  const idm = p.match(/^<h3 id="([^"]+)"/);
  const id = idm ? idm[1] : '???';
  const h4 = (p.match(/<h4 id="/g) || []).length;
  const code = (p.match(/class="codeWrap"/g) || []).length;
  const ok = h4 >= 2 && code >= 1;
  if (!ok) fail++;
  rows.push({ id, h4, code, ok });
}
rows.forEach(r => { if (!r.ok) console.log('FAIL', r); });
console.log('sections failing (h4>=2 && code>=1):', fail);

// h4 ids per chapter
const counts = {};
for (const r of rows) {
  const ch = r.id.split('-')[0];
  counts[ch] = (counts[ch] || 0) + r.h4;
}
console.log('h4 per chapter:', JSON.stringify(counts));
console.log('total h4 in sections:', rows.reduce((a, r) => a + r.h4, 0));

// duplicate ids anywhere in file
const ids = [...s.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
const dups = [...new Set(dup)];
console.log('duplicate ids:', dups.length ? dups : 'none');

// duplicate h4 ids specifically
const h4ids = [...s.matchAll(/<h4 id="([^"]+)"/g)].map(m => m[1]);
const dh = h4ids.filter((v, i) => h4ids.indexOf(v) !== i);
console.log('duplicate h4 ids:', dh.length ? [...new Set(dh)] : 'none');
console.log('total h4 (with id):', h4ids.length);
