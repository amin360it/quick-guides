// Depth + structure checker for react.html (and for fragment files).
// Usage: node checkreact.js [file.html]
// Measures per-h3-section: prose bytes (code/tables stripped), code samples,
// nested h4/h5. Also checks id uniqueness, sidebar/ch-toc coverage.
const fs = require('fs');
const file = process.argv[2] || 'react.html';
let html = fs.readFileSync(file, 'utf8');

// Fragment mode: wrap bare sections so the parser sees a document.
if (!/<section class="chapter">/.test(html)) html = '<main>' + html + '</main>';

const strip = (s) => s
  .replace(/<div class="codeWrap">[\s\S]*?<\/div>/g, '')
  .replace(/<table[\s\S]*?<\/table>/g, '')
  .replace(/<pre[\s\S]*?<\/pre>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&middot;/g, '·')
  .replace(/\s+/g, ' ').trim();

const sections = [];
// split on h3 boundaries
const h3re = /<h3 id="([^"]+)"([^>]*)>([\s\S]*?)<\/h3>/g;
const marks = [];
let m;
while ((m = h3re.exec(html))) marks.push({ id: m[1], attrs: m[2], text: strip(m[3]), index: m.index });
for (let i = 0; i < marks.length; i++) {
  const start = marks[i].index;
  const end = i + 1 < marks.length ? marks[i + 1].index
    : (() => { const n = html.indexOf('<h2 ', start); return n === -1 ? html.length : n; })();
  const span = html.slice(start, end);
  sections.push({
    id: marks[i].id,
    toc: /data-toc/.test(marks[i].attrs),
    prose: Buffer.byteLength(strip(span.replace(/^<h3[^>]*>[\s\S]*?<\/h3>/, '')), 'utf8'),
    code: (span.match(/<div class="codeWrap">/g) || []).length,
    nested: (span.match(/<h[45][ >]/g) || []).length,
  });
}

const ids = [];
const idre = /<h[234][^>]*\bid="([^"]+)"/g;
while ((m = idre.exec(html))) ids.push(m[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);

const chapters = (html.match(/<section class="chapter">/g) || []).length;
const topics = (html.match(/data-toc/g) || []).length;
const codeAll = (html.match(/<div class="codeWrap">/g) || []).length;

let fail = 0;
console.log(`file=${file} chapters=${chapters} topics=${topics} code=${codeAll} h3sections=${sections.length} dupIds=[${[...new Set(dup)].join(',')}]`);
if (dup.length) { fail = 1; console.log('FAIL: duplicate ids'); }
for (const s of sections) {
  const bad = [];
  if (s.prose < 1500) bad.push(`prose=${s.prose}`);
  if (s.code < 2) bad.push(`code=${s.code}`);
  if (s.nested < 1) bad.push(`nested=${s.nested}`);
  if (!s.toc) bad.push('NO data-toc');
  if (bad.length) { fail = 1; console.log(`  FAIL ${s.id}: ${bad.join(' ')}`); }
}
if (!fail) console.log('  all h3 sections pass floors');
// per-section summary when asked
if (process.env.VERBOSE) for (const s of sections) console.log(`  ${s.id}\tprose=${s.prose}\tcode=${s.code}\tnested=${s.nested}`);
process.exit(fail);
