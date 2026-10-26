const fs = require('fs');
const s = fs.readFileSync('bootstrap5.html', 'utf8');
const regex = /<h3 id="ch3-spacing"[^>]*>/;
const m = s.match(regex);
console.log(m ? m[0] : 'not found');