const fs = require('fs');
const s = fs.readFileSync('jquery.html', 'utf8');
const a = s.indexOf('<div class="ch-toc"');
const b = s.indexOf('</div></div>', a) + '</div></div>'.length;
console.log('CH-TOC:');
console.log(s.slice(a, b));
console.log('\nNAV (first 700 chars):');
const n = s.indexOf('<nav id="toc"');
console.log(s.slice(n, n + 700));
