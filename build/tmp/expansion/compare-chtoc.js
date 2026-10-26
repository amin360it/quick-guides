const fs = require('fs');
const a = fs.readFileSync('build/bak/expansion/package-publishing.html', 'utf8').split('\n');
const b = fs.readFileSync('package-publishing.html', 'utf8').split('\n');
const ct = f => f.filter(l => l.includes('class="ch-toc"'));
const A = ct(a), B = ct(b);
console.log('backup ch-toc lines', A.length, 'current', B.length, 'identical:', JSON.stringify(A) === JSON.stringify(B));
if (JSON.stringify(A) !== JSON.stringify(B)) {
  for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) console.log('DIFF line', i, '\n old:', A[i], '\n new:', B[i]);
}
const pt = f => f.filter(l => l.includes('class="topic-desc"'));
console.log('topic-desc lines:', pt(a).length, pt(b).length);
