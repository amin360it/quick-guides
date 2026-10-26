// List each h2 block of a guide: id, bytes, h3, h4, code.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const f = process.argv[2];
const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
const main = s.slice(s.indexOf('<main id='), s.lastIndexOf('</main>'));
const re = /<h2 id="([^"]+)"[^>]*data-toc[\s\S]*?(?=<h2 id="|$)/g;
let m; let i = 0;
const blocks = [];
while ((m = re.exec(main))) {
  const body = m[0];
  const id = m[1];
  blocks.push({
    i: i++,
    id,
    bytes: Buffer.byteLength(body),
    h3: (body.match(/<h3[^>]*data-toc/g) || []).length,
    h4: (body.match(/<h4[ >]/g) || []).length,
    code: (body.match(/class="codeWrap"/g) || []).length,
    title: (body.match(/>([^<]*)<\/h2>/) || [, ''])[1].trim(),
  });
}
for (const b of blocks) {
  console.log(String(b.i).padStart(2) + '  ' + b.id.padEnd(18) + ' bytes=' + String(b.bytes).padStart(7) + ' h3=' + String(b.h3).padStart(2) + ' h4=' + String(b.h4).padStart(3) + ' code=' + String(b.code).padStart(2) + '  ' + b.title);
}
console.log('blocks: ' + blocks.length + ' | total main bytes: ' + Buffer.byteLength(main));
