const fs = require('fs');
const p = process.argv[2];
const s = fs.readFileSync(p, 'utf8');
const re = /<div class="(tip|warn|note|ex)">([\s\S]*?)<\/div>/g;
const all = [...s.matchAll(re)];
const bare = all.filter(m => !m[2].trim().startsWith('<'));
console.log('total callouts', all.length, 'bare-text', bare.length, 'wrapped', all.length - bare.length);

if (process.argv[3] === '--fix') {
  let n = 0;
  const out = s.replace(re, (m, cls, inner) => {
    if (inner.trim().startsWith('<')) return m;
    n++;
    return `<div class="${cls}"><p>${inner}</p></div>`;
  });
  if (n !== bare.length) throw new Error('count mismatch');
  if (out.length <= s.length) throw new Error('did not grow');
  fs.writeFileSync(p, out);
  console.log('wrapped', n, 'callouts;', s.length, '->', out.length);
}
