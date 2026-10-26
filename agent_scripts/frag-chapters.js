// List the chapter (h2) ids and titles inside a fragment file.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
for (const f of files) {
  const abs = path.isAbsolute(f) ? f : path.join(ROOT, f);
  const s = fs.readFileSync(abs, 'utf8');
  const h2 = [...s.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];
  const h3 = [...s.matchAll(/<h3 id="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const h4 = (s.match(/<h4[ >]/g) || []).length;
  const cw = (s.match(/class="codeWrap"/g) || []).length;
  console.log('===== ' + f + ' :: ' + h2.length + ' chapters, ' + h3.length + ' h3, ' + h4 + ' h4, ' + cw + ' code =====');
  console.log('  H2 ids: ' + h2.map((m) => m[1]).join(', '));
  console.log('  H2 titles: ' + h2.map((m) => m[2].replace(/<[^>]+>/g, '').trim()).join(' | '));
  console.log('  H3 ids: ' + h3.join(', '));
}
