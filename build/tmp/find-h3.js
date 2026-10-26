const fs = require('fs');
const s = fs.readFileSync('bootstrap5.html', 'utf8');
// Find ch3-spacing h3 and the text after it
const idx = s.indexOf('<h3 id="ch3-spacing"');
if (idx !== -1) {
  console.log('Found at index:', idx);
  console.log('Context:', s.substring(idx, idx + 150));
} else {
  console.log('Not found');
}