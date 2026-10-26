// Find </section> closers that have no matching <section ...> open, by line.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const file = process.argv[2];
const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
const mainStart = s.indexOf('<main id="content">');
const mainEnd = s.lastIndexOf('</main>');
const body = s.slice(mainStart, mainEnd);
// line number lookup
const lineOf = (idx) => body.slice(0, idx).split('\n').length;
const tok = /<section\b[^>]*>|<\/section>/g;
let m;
let depth = 0;
let strays = 0;
while ((m = tok.exec(body))) {
  if (m[0] === '</section>') {
    if (depth === 0) {
      strays++;
      const ln = lineOf(m.index);
      const lineText = s.split('\n')[ln - 1 + (s.slice(0, mainStart).split('\n').length - 1)] || '';
      console.log('STRAY </section> at file line ' + (ln + s.slice(0, mainStart).split('\n').length - 1) + '  | ' + lineText.trim().slice(0, 110));
    } else depth--;
  } else {
    depth++;
  }
}
console.log('strays: ' + strays + ' | final depth: ' + depth);
