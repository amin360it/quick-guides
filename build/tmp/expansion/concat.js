const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'parts');
const files = fs.readdirSync(dir).filter(f => /^\d\d-.*\.txt$/.test(f)).sort();
const out = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(__dirname, 'rust-programming.txt'), out, 'utf8');

// sanity: report the h2 titles' separator chars
const re = /<h2 id="(ch\d+)" data-toc>([^<]*)<\/h2>/g;
let m;
while ((m = re.exec(out))) {
  const sep = m[2].charCodeAt(2).toString(16);
  console.log(m[1], 'separator U+' + sep.toUpperCase());
}
console.log('total bytes:', Buffer.byteLength(out, 'utf8'));