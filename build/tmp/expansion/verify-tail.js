const fs = require('fs');
const h = fs.readFileSync('api-design.html', 'utf8');
const o = (h.match(/<section class="chapter"/g) || []).length;
const c = (h.match(/<\/section>/g) || []).length;
console.log('sections open/close:', o, '/', c);
console.log('main open:', (h.match(/<main id="content">/g) || []).length,
  ' close:', (h.match(/<\/main>/g) || []).length);
const m = h.indexOf('<h2 id="ch6"');
const tail = h.slice(m);
console.log('ch6+ h2 open:', (tail.match(/<h2/g) || []).length,
  ' h2 close:', (tail.match(/<\/h2>/g) || []).length);
console.log('ch6+ h3 count:', (tail.match(/<h3 id="/g) || []).length);
console.log('ch6+ codeWrap count:', (tail.match(/class="codeWrap"/g) || []).length);
console.log('ch6+ Exercises blocks:', (tail.match(/Exercises \d/g) || []).length);
console.log('sidebar untouched check: nav#toc still present:', /<nav id="toc"/.test(h));
console.log('ch-toc count:', (h.match(/class="ch-toc"/g) || []).length,
  ' band count:', (h.match(/class="am-band"/g) || []).length);
console.log('\nALL h2 ids:');
console.log([...h.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]).join('\n'));