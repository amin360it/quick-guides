'use strict';
/* metrics.js — print real chapter/h2/h3/code/prose/size metrics for pages. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const pages = process.argv.slice(2);
for (const p of pages) {
  const file = path.join(ROOT, p);
  let s;
  try { s = fs.readFileSync(file, 'utf8'); } catch (e) { console.log(p + ': MISSING'); continue; }
  const mainStart = s.indexOf('<main id="content">');
  const mainEnd = s.indexOf('</main>');
  const main = mainStart >= 0 && mainEnd > mainStart ? s.slice(mainStart, mainEnd) : '(no main)';
  const chapters = (main.match(/<section class="chapter">/g) || []).length;
  const h2 = (main.match(/<h2 /g) || []).length;
  const h3 = (main.match(/<h3 /g) || []).length;
  const h4 = (main.match(/<h4 /g) || []).length;
  const code = (main.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const proseNoTags = main.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const bytes = Buffer.byteLength(s);
  // band counts
  const bm = /(\d+) chapters &middot; (\d+) topics &middot; (\d+) code samples/.exec(s);
  const band = bm ? bm.slice(1).join('/') : 'none';
  console.log(p + ' | chapters=' + chapters + ' h2=' + h2 + ' h3=' + h3 + ' h4=' + h4 + ' code=' + code +
    ' proseKB=' + (Buffer.byteLength(proseNoTags, 'utf8') / 1024).toFixed(1) +
    ' sizeKB=' + (bytes / 1024).toFixed(0) + ' band=' + band);
}