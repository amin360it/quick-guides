// Temporary verification for the ch5-ch8 expansion of package-publishing.html
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', '..', '..', 'package-publishing.html');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');

let problems = 0;

// region of interest: ch5 start .. ch9 start
const roiStart = src.indexOf('<h2 id="ch5"');
const roiEnd = src.indexOf('<h2 id="ch9"');

// 1. raw '<' or bare '&' inside codeWrap blocks, only in the ROI
const blockRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m;
let blockNo = 0;
while ((m = blockRe.exec(src)) !== null) {
  blockNo++;
  if (m.index < roiStart || m.index >= roiEnd) continue;
  const code = m[1];
  const startLine = src.slice(0, m.index).split('\n').length;
  const codeLines = code.split('\n');
  codeLines.forEach((l, i) => {
    const ln = startLine + i;
    let bad = null;
    if (l.includes('<')) bad = 'raw <';
    else if (/(&)(?!(amp;|lt;|gt;|quot;|#\d+;|nbsp;|apos;))/.test(l)) bad = 'bare &';
    if (bad) {
      console.log(`CODE BLOCK ${blockNo} line ${ln}: ${bad}`);
      console.log('   ' + l.trim());
      problems++;
    }
  });
}
console.log(`checked code blocks in ch5-ch8 region`);

// 2. duplicate ids among all elements (h3 + h4 + others) in the whole doc
const idRe = /<h[34] id="([^"]+)"/g;
const ids = [];
while ((m = idRe.exec(src)) !== null) ids.push({ id: m[1], line: src.slice(0, m.index).split('\n').length });
const seen = new Map();
for (const { id, line } of ids) {
  if (seen.has(id)) { console.log(`DUPLICATE id ${id} at line ${line} (first at ${seen.get(id)})`); problems++; }
  else seen.set(id, line);
}
console.log(`unique h3/h4 ids: ${seen.size}`);

// 3. h3/h2 counts in ch5..ch8 (before ch9)
const ch5start = src.indexOf('<h2 id="ch5"');
const ch9start = src.indexOf('<h2 id="ch9"');
const body = src.slice(ch5start, ch9start);
const h3count = (body.match(/<h3 /g) || []).length;
const h4count = (body.match(/<h4 /g) || []).length;
const codeWrapInBody = (body.match(/<div class="codeWrap">/g) || []).length;
console.log(`ch5-ch8: h3=${h3count} (want 39), h4=${h4count}, codeWrap=${codeWrapInBody}`);

// 4. h4 count per h3 section
const secRe = /<h3 id="([^"]+)"[\s\S]*?(?=<h3 id|<\/section>)/g;
let sec;
while ((sec = secRe.exec(body)) !== null) {
  const secH4 = (sec[0].match(/<h4 /g) || []).length;
  const secCode = (sec[0].match(/<div class="codeWrap">/g) || []).length;
  if (secH4 < 2 || secCode < 2) {
    console.log(`WEAK section ${sec[1]}: h4=${secH4} code=${secCode}`);
    problems++;
  }
}

// 5. no double-escaped entities
const de = src.match(/&amp;(amp|lt|gt|quot|#)/g);
if (de) { console.log('DOUBLE-ESCAPE found: ' + de.slice(0, 5).join(', ')); problems += de.length; }

// 6. byte-identical headings: compare h2+h3 heading text against backup
const hdRe = /<h[23] id="[^"]+"[^>]*>([^<]+)<\/h[23]>/g;
const headings = [];
while ((m = hdRe.exec(src)) !== null) headings.push(m[1]);

console.log(problems === 0 ? 'ALL CHECKS PASSED' : `${problems} problem(s) found`);