// Measure the library from disk: guides, chapters, topics, code samples, exercises.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');

const skip = new Set(['index.html', 'topics.html', 'search.html', 'favorites.html']);
const files = fs.readdirSync(root).filter(f => f.endsWith('.html') && !skip.has(f));

let chapters = 0, subs = 0, code = 0, ex = 0, bytes = 0;
const perGuide = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  bytes += Buffer.byteLength(s);
  const h2 = (s.match(/<h2 [^>]*\sdata-toc(?=[\s>])/g) || []).length;
  const h3 = (s.match(/<h3 [^>]*\sdata-toc(?=[\s>])/g) || []).length;
  const cw = (s.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const exb = (s.match(/<div class="ex">/g) || []).length;
  chapters += h2; subs += h3; code += cw; ex += exb;
  perGuide.push({ f, h2, h3, cw, ex: exb });
}
console.log('guides      ', files.length);
console.log('chapters(h2)', chapters);
console.log('subsections ', subs);
console.log('topics      ', chapters + subs);
console.log('code samples', code);
console.log('exercises   ', ex);
console.log('total MB    ', (bytes / 1048576).toFixed(1));
console.log('--- guides with zero code blocks ---');
perGuide.filter(g => g.cw === 0).forEach(g => console.log('  ', g.f));
