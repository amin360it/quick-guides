const fs = require('fs');
for (const f of ['build/tmp/ch18.html', 'build/tmp/ch19.html', 'build/tmp/ch11.html']) {
  const s = fs.readFileSync(f, 'utf8');
  const i = s.indexOf('class="ex"');
  console.log(f, 'ex at', i);
  if (i < 0) continue;
  console.log('  before:', JSON.stringify(s.slice(i - 100, i)));
  const j = s.indexOf('</section>', i);
  console.log('  after :', JSON.stringify(s.slice(i, i + 60)));
  console.log('  to sect close:', JSON.stringify(s.slice(j - 40, j + 20)));
}
