const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const EXCLUDE = /^(index|topics|search|favorites|test|searchindex)\b/;
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.test(f)).sort();

let ch = 0, sub = 0, topics = 0, code = 0, ex = 0;
const per = {};
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const main = s.slice(s.indexOf('<main id='), s.lastIndexOf('</main>'));
  const h2 = (main.match(/<h2[ >]/g) || []).length;
  const h3 = (main.match(/<h3[ >]/g) || []).length;
  const toc = (main.match(/<h[23][^>]*\bdata-toc\b/g) || []).length;
  const cw = (main.match(/class="codeWrap"/g) || []).length;
  // headings whose text is an exercise title
  let e = 0;
  const re = /<h([345])\b[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(main)) !== null) if (/\bexercises?\b/i.test(m[2]) && /^Exercise/i.test(m[2].replace(/<[^>]+>/g, '').trim())) e++;
  ch += h2; sub += h3; topics += toc; code += cw; ex += e;
  per[f] = { h2, h3, toc, cw, e };
}
const n = (v) => v.toLocaleString('en-US');
console.log(JSON.stringify({ guides: files.length, chapters: ch, subsections: sub, topics, codeSamples: code, exerciseSets: ex }, null, 2));
console.log('formatted:', n(files.length), n(ch), n(sub), n(topics), n(code), n(ex));
global.__per = per;
module.exports = per;
