'use strict';
/* Measure depth per guide, mirroring AGENTS.md's depth rules:
   - prose bytes per h3 section (code blocks + tables stripped)
   - code samples per section
   - nested h4/h5 per section
   Reports the thinnest pages first. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !['index.html', 'topics.html', 'search.html', 'favorites.html'].includes(f));

function stripCode(s) { return s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, ''); }
function stripTables(s) { return s.replace(/<div class="table-scroll">[\s\S]*?<\/div>/g, ''); }
function stripTags(s) { return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, 'x').replace(/\s+/g, ' ').trim(); }
function countCode(s) { const re = /<div class="codeWrap"><pre><code>/g; let c = 0; while (re.exec(s)) c++; return c; }

const rows = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  // split chapters (h2) then sections (h3)
  const h2s = [...s.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>|<section class="chapter"[\s\S]*?<\/section>/g)];
  let chapters = 0, sections = 0, proseTotal = 0, codeTotal = 0, h4 = 0;
  const secRe = /<h3[^>]*id="[^"]*"[^>]*data-toc[\s\S]*?(?=<h3|<\/section>|$)/g;
  const mSec = [...s.matchAll(/<section class="chapter">[\s\S]*?<\/section>/g)];
  if (mSec.length) {
    for (const [chunk] of mSec) {
      chapters++;
      const h3s = [...chunk.matchAll(/<h3[^>]*id="[^"]*"[\s\S]*?(?=<h3|<\/section>)/g)];
      for (const [sc] of h3s) {
        sections++;
        let body = stripTables(stripCode(sc));
        body = stripTags(body);
        const prose = Buffer.byteLength(body, 'utf8');
        proseTotal += prose;
        codeTotal += countCode(sc);
        h4 += (sc.match(/<h[45][^>]*>/g) || []).length;
      }
    }
  }
  rows.push({ f, chapters, sections, proseTotal, codeTotal, h4, size: s.length,
    avg: sections ? Math.round(proseTotal / sections) : 0,
    codePerSec: sections ? (codeTotal / sections).toFixed(1) : 0 });
}

rows.sort((a, b) => (b.sections - a.sections) || (a.avg - b.avg));
console.log('File               | Ch | Sec | Code | h4/h5 | Avg prose/section');
for (const r of rows) {
  console.log(
    r.f.padEnd(19) + ' | ' +
    String(r.chapters).padStart(2) + ' | ' +
    String(r.sections).padStart(3) + ' | ' +
    String(r.codeTotal).padStart(4) + ' | ' +
    String(r.h4).padStart(4) + ' | ' +
    String(r.avg).padStart(7)
  );
}