'use strict';
/* scanall.js — depth metrics for every guide, thinnest first. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const rows = [];
for (const f of fs.readdirSync(ROOT).filter((x) => x.endsWith('.html')).sort()) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const mS = s.indexOf('<main id="content">');
  const mE = s.indexOf('</main>');
  const main = mS >= 0 && mE > mS ? s.slice(mS, mE) : '';
  const chapters = (main.match(/<section class="chapter">/g) || []).length;
  const h3 = (main.match(/<h3 /g) || []).length;
  const h4 = (main.match(/<h4 /g) || []).length;
  const code = (main.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const prose = Buffer.byteLength(main.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), 'utf8');
  const perSec = h3 ? Math.round(prose / h3) : 0;
  rows.push({ f, chapters, h3, h4, code, proseKB: Math.round(prose / 1024), perSec, sizeKB: Math.round(Buffer.byteLength(s) / 1024) });
}
rows.sort((a, b) => a.perSec - b.perSec);
console.log('file | ch | h3 | h4 | code | proseKB | Bpersection | sizeKB');
for (const r of rows) {
  console.log(`${r.f} | ${r.chapters} | ${r.h3} | ${r.h4} | ${r.code} | ${r.proseKB} | ${r.perSec} | ${r.sizeKB}`);
}