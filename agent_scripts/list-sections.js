'use strict';
// List each chapter's heading text (h1 band + h2 headings) in a guide.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  console.log('===== ' + f + ' =====');
  const secs = s.match(/<section class="chapter">[\s\S]*?(?=<section class="chapter">|<\/main>)/g) || [];
  console.log('sections: ' + secs.length);
  secs.forEach((sec, i) => {
    const h2 = (sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '?';
    const h3 = (sec.match(/<h3/g) || []).length;
    const h4 = (sec.match(/<h4/g) || []).length;
    const code = (sec.match(/<div class="codeWrap">/g) || []).length;
    console.log('  ' + String(i + 1).padStart(2) + '. ' + h2.replace(/<[^>]+>/g, '').trim().slice(0, 46).padEnd(48) + ' h3=' + h3 + ' h4=' + h4 + ' code=' + code);
  });
}
