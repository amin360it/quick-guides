const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
console.log('total', s.length);
const i = s.indexOf('id="ch10"');
console.log('ch10 at', i);
const j = s.indexOf('</section>', i);
console.log('close at', j);
console.log('AFTER CH10:', JSON.stringify(s.slice(j - 120, j + 400)));
// what follows main?
const m = s.indexOf('</main>');
console.log('main close at', m, JSON.stringify(s.slice(m - 200, m + 60)));
