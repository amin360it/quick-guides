const fs = require('fs');
const f = process.argv[2] || 'nextjs.html';
const s = fs.readFileSync(f, 'utf8');
const cnt = (re) => (s.match(re) || []).length;
console.log('file:', f);
console.log('div open ', cnt(/<div(?:\s[^>]*)?>/g), 'close', cnt(/<\/div>/g));
console.log('pre open ', cnt(/<pre(?:\s[^>]*)?>/g), 'close', cnt(/<\/pre>/g));
console.log('code open', cnt(/<code(?:\s[^>]*)?>/g), 'close', cnt(/<\/code>/g));
console.log('codeWrap open   ', cnt(/<div class="codeWrap">/g));
console.log('closer seq      ', cnt(/<\/code><\/pre><\/div>/g));
console.log('full block open ', cnt(/<div class="codeWrap"><pre><code>/g));

// find every </code></pre></div> and check what precedes each block
const re = /<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g;
let m, last = 0, idx;
while ((m = re.exec(s))) last = m.index + m[0].length;
console.log('end of last matched block at', last, 'of', s.length);
console.log('tail after last block:', JSON.stringify(s.slice(last, last + 80)));
