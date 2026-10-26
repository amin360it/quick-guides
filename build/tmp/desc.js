const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
const i = s.indexOf('name="description"');
const desc = s.slice(i, i + 300).match(/content="([^"]*)"/)[1];
console.log('OLD LEN', desc.length);
console.log(JSON.stringify(desc));

const parts = ['ch11','ch12','ch13','ch14','ch15','ch16full','ch17','ch18','ch19'];
let toc = 0, code = 0;
for (const p of parts) {
  const f = fs.readFileSync('build/tmp/' + p + '.html', 'utf8');
  toc += (f.match(/data-toc/g) || []).length;
  code += (f.match(/class="codeWrap"/g) || []).length;
}
console.log('frag toc:', toc, 'frag code:', code);
const newDesc = desc.replace('11 chapters, 90 topics and 85 code samples',
  '20 chapters, ' + (90 + toc) + ' topics and ' + (85 + code) + ' code samples');
console.log('NEW LEN', newDesc.length);
console.log(JSON.stringify(newDesc));
