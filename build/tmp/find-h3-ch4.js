const fs = require('fs');
const s = fs.readFileSync('bootstrap5.html', 'utf8');
// Find ch4-headings h3
const idx = s.indexOf('<h3 id="ch4-headings"');
if (idx !== -1) {
  console.log('Found at index:', idx);
  console.log('Context:', s.substring(idx, idx + 120));
} else {
  console.log('Not found');
}