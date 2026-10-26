const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');

// 1. sidebar ch10 entry
const si = s.indexOf('data-target="ch10"');
console.log('SIDEBAR ch10 ctx:', JSON.stringify(s.slice(si - 200, si + 900)));
console.log('---');
// 2. end of sidebar nav
const ne = s.indexOf('</nav>', si);
console.log('NAV END ctx:', JSON.stringify(s.slice(ne - 300, ne + 40)));
console.log('---');
// 3. band
const b = s.indexOf('am-band-s');
console.log('BAND:', JSON.stringify(s.slice(b - 60, b + 300)));
console.log('---');
// 4. meta description
const d = s.indexOf('name="description"');
console.log('DESC:', JSON.stringify(s.slice(d, d + 400)));
console.log('---');
// 5. wordCount
const w = s.indexOf('wordCount');
console.log('WORD:', JSON.stringify(s.slice(w - 20, w + 120)));
console.log('---');
// 6. hasPart start
const hp = s.indexOf('hasPart');
console.log('HASPART:', JSON.stringify(s.slice(hp, hp + 600)));
