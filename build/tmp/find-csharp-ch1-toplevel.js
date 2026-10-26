const fs = require('fs');
const s = fs.readFileSync('csharp.html', 'utf8');
const idx = s.indexOf('<h3 id="ch1-toplevel"');
if (idx !== -1) {
  console.log('Found at index:', idx);
  console.log('Context:', s.substring(idx, idx + 100));
} else {
  console.log('Not found');
}