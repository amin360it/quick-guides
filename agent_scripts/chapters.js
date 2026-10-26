// List the chapter (h2[data-toc]) ids and titles of one or more guides.
// Usage: node chapters.js html.html css.html ...
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
if (!files.length) { console.log('usage: node chapters.js <file.html> ...'); process.exit(1); }
for (const f of files) {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) { console.log('== ' + f + ' :: MISSING'); continue; }
  const s = fs.readFileSync(abs, 'utf8');
  const main = s.slice(s.indexOf('<main id='), s.lastIndexOf('</main>'));
  const h2 = [...main.matchAll(/<h2 id="([^"]+)"[^>]*data-toc[^>]*>([\s\S]*?)<\/h2>/g)];
  const h3 = (main.match(/<h3[^>]*data-toc/g) || []).length;
  const h4 = (main.match(/<h4[ >]/g) || []).length;
  const cw = (main.match(/class="codeWrap"/g) || []).length;
  console.log('===== ' + f + ' :: ' + h2.length + ' chapters, ' + h3 + ' h3, ' + h4 + ' h4, ' + cw + ' code =====');
  console.log(h2.map((m) => m[1] + '  ::  ' + m[2].replace(/<[^>]+>/g, '').trim()).join('\n'));
}
