// List every h3 that has no h4 before the next h2/h3.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const segs = s.split(/(?=<h[23]\b)/);
  let bad = 0;
  for (const seg of segs) {
    if (/^<h3\b/.test(seg) && !/<h4[ >]/.test(seg)) {
      bad++;
      const head = seg.slice(0, 140).replace(/\n/g, ' ');
      console.log(f + ' :: ' + head);
    }
  }
  console.log(f + ' :: h3-without-h4 = ' + bad);
}
