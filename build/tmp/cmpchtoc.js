const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
const i = s.indexOf('id="ch10"');
const k = s.lastIndexOf('<div class="ch-toc"', i);
console.log('REACT:', JSON.stringify(s.slice(k, k + 340)));
const f = fs.readFileSync('build/tmp/ch11.html', 'utf8');
const q = f.indexOf('<div class="ch-toc"');
console.log('FRAG :', JSON.stringify(f.slice(q, q + 340)));
// also check an existing ch-toc entry style in react (sidebar uses <a>)
const t = s.lastIndexOf('<nav id="toc"');
console.log('SIDEBAR START:', JSON.stringify(s.slice(t, t + 400)));
