const fs = require('fs');
const s = fs.readFileSync('build/tmp/pkg-ch10-11.html', 'utf16le');
const out = [];
const h2 = s.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || [];
h2.forEach(x => out.push('H2: ' + JSON.stringify(x)));
const toc = s.match(/<div class="ch-toc">[\s\S]*?<\/div><\/div>/g) || [];
toc.forEach((x, i) => out.push('TOC' + i + ': ' + x));
const td = s.match(/<p class="topic-desc">[\s\S]*?<\/p>/g) || [];
td.forEach((x, i) => out.push('TD' + i + ': ' + x));
out.push('sections: ' + (s.match(/<section class="chapter">/g) || []).length);
out.push('h3: ' + (s.match(/<h3 /g) || []).length);
out.push('h4: ' + (s.match(/<h4/g) || []).length);
out.push('codeWrap: ' + (s.match(/class="codeWrap"/g) || []).length);
// char inspection of h2
h2.forEach(x => {
  out.push('h2 chars: ' + [...x].filter(c => c.codePointAt(0) > 127).map(c => JSON.stringify(c) + ' U+' + c.codePointAt(0).toString(16)).join(' '));
});
td.forEach(x => {
  out.push('td chars: ' + [...x].filter(c => c.codePointAt(0) > 127).map(c => JSON.stringify(c) + ' U+' + c.codePointAt(0).toString(16)).join(' '));
});
fs.writeFileSync('build/tmp/extract-out2.txt', out.join('\n'), 'utf8');
console.log('done');
