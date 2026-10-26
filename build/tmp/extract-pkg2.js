const fs = require('fs');
const s = fs.readFileSync('build/tmp/pkg-ch10-11.utf8.html', 'utf8');
const h2 = s.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || [];
h2.forEach(x => {
  console.log(JSON.stringify(x));
  console.log([...x].map(c => c.codePointAt(0) > 127 ? c + '(U+' + c.codePointAt(0).toString(16).toUpperCase() + ')' : c).join(''));
});
const td = s.match(/<p class="topic-desc">[\s\S]*?<\/p>/g) || [];
td.forEach(x => console.log('TD:', JSON.stringify(x)));
// codeWrap opening forms
const cw = s.match(/<div class="codeWrap">/g) || [];
console.log('plain codeWrap:', cw.length);
console.log('any codeWrap variants:', [...new Set(s.match(/<div class="[^"]*codeWrap[^"]*"[^>]*>/g) || [])]);
// h4 tags
const h4 = s.match(/<h4[^>]*>/g) || [];
console.log('h4 tags:', JSON.stringify(h4));
// check ids
const ids = s.match(/id="[^"]*"/g) || [];
console.log('ids sample:', ids.slice(0, 5));
