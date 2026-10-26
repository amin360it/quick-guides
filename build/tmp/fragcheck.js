const fs = require('fs');
const parts = ['ch11','ch12','ch13','ch14','ch15','ch16full','ch17','ch18','ch19'];
for (const p of parts) {
  const s = fs.readFileSync('build/tmp/' + p + '.html', 'utf8');
  const head = s.slice(0, 90).replace(/\s+/g, ' ');
  const tail = s.slice(-60).replace(/\s+/g, ' ');
  const open = (s.match(/<section/g) || []).length;
  const close = (s.match(/<\/section>/g) || []).length;
  const ex = s.includes('class="ex"');
  console.log(p, '| sections', open + '/' + close, '| ex', ex, '| head:', head);
  console.log('   tail:', tail);
}
