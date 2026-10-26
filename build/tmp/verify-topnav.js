'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const issues = [];

// 1. No page should still reference the old single-panel dropdown machinery.
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const pat of ['tn-group', 'toggleCatGroup', 'tn-group-categories']) {
    if (s.includes(pat)) issues.push(`${f}: still contains "${pat}"`);
  }
  // 2. Every page must load shell.js (the GUIDES menu lives there).
  if (!/<script[^>]*src="assets\/shell\.js"/.test(s)) {
    issues.push(`${f}: does not load assets/shell.js`);
  }
}

// 3. hub.js / hub.css should not reference the removed dropdown.
for (const a of ['assets/hub.js', 'assets/hub.css']) {
  const s = fs.readFileSync(path.join(ROOT, a), 'utf8');
  for (const pat of ['tn-group', 'toggleCatGroup']) {
    if (s.includes(pat)) issues.push(`${a}: still contains "${pat}"`);
  }
}

// 4. The catalog in shell.js must point at files that exist on disk.
const shell = fs.readFileSync(path.join(ROOT, 'assets/shell.js'), 'utf8');
const fileRe = /\[('[a-z0-9-]+\.html', '[^']*')\]/g;
let m;
const catFiles = new Set();
while ((m = fileRe.exec(shell))) {
  const f = m[1].split("', '")[0].slice(1);
  catFiles.add(f);
  if (!fs.existsSync(path.join(ROOT, f))) issues.push(`shell.js catalog references missing file: ${f}`);
}

// 5. Every guide file on disk (each has a shell.js load line) should be in the catalog.
//    Feature pages (favorites/search) are not guides and are excluded.
const NON_GUIDES = new Set(['favorites.html', 'search.html']);
const guides = files.filter((f) => {
  if (NON_GUIDES.has(f)) return false;
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  return s.includes('<h1 class="am-band"') || s.includes('class="chapter"');
});
for (const g of guides) {
  if (!catFiles.has(g)) issues.push(`guide not in GUIDES_CATALOG: ${g}`);
}

console.log('catalog entries:', catFiles.size);
console.log('guides detected on disk:', guides.length);
if (issues.length) {
  console.log('\nISSUES:');
  for (const i of issues) console.log('  - ' + i);
} else {
  console.log('\nNO ISSUES FOUND');
}