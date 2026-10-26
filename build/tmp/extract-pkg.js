const fs = require('fs');
const s = fs.readFileSync('build/tmp/pkg-ch10-11.utf8.html', 'utf8');
const h2 = s.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || [];
h2.forEach(x => console.log('H2:', JSON.stringify(x)));
const toc = s.match(/<div class="ch-toc">[\s\S]*?<\/div><\/div>/g) || [];
toc.forEach((x, i) => console.log('TOC' + i + ':', x));
const td = s.match(/<p class="topic-desc">[\s\S]*?<\/p>/g) || [];
td.forEach((x, i) => console.log('TD' + i + ':', x));
// count sections, h3, h4, codeWrap
console.log('sections:', (s.match(/<section class="chapter">/g) || []).length);
console.log('h3:', (s.match(/<h3 /g) || []).length);
console.log('h4:', (s.match(/<h4/g) || []).length);
console.log('codeWrap:', (s.match(/class="codeWrap"/g) || []).length);
