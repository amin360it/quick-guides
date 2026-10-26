const fs = require('fs');
const a = fs.readFileSync('build/bak/expansion/package-publishing.html', 'utf8');
const b = fs.readFileSync('package-publishing.html', 'utf8');
const ex = s => [...s.matchAll(/<h[23] id="[^"]+"[^>]*>[^<]*<\/h[23]>/g)].map(m => m[0]);
const A = ex(a), B = ex(b);
console.log('backup headings', A.length, 'current', B.length);
const diffs = [];
for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) diffs.push([i, A[i], B[i]]);
console.log('heading diffs:', diffs.length);
diffs.slice(0, 20).forEach(d => console.log(JSON.stringify(d)));

// sidebar TOC, band and ch-toc comparisons
for (const [name, re] of Object.entries({
  toc: /<nav id="toc"[\s\S]*?<\/nav>/,
  band: /<h1 class="am-band">[\s\S]*?<\/h1>/,
})) {
  const ma = a.match(re), mb = b.match(re);
  console.log(name, 'identical:', !!(ma && mb && ma[0] === mb[0]));
}

// ch-toc blocks
const cta = (a.match(/<div class="ch-toc">[\s\S]*?<\/div><\/div><\/div>/g) || []);
const ctb = (b.match(/<div class="ch-toc">[\s\S]*?<\/div><\/div><\/div>/g) || []);
console.log('ch-toc count', cta.length, ctb.length, 'identical:', JSON.stringify(cta) === JSON.stringify(ctb));
