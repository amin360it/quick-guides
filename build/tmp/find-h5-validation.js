const fs = require('fs');
const s = fs.readFileSync('bootstrap5.html', 'utf8');
const idx = s.indexOf('<h3 id="ch5-validation"');
if (idx !== -1) {
  console.log('Found at index:', idx);
  console.log('Context:', s.substring(idx, idx + 120));
} else {
  console.log('Not found');
}