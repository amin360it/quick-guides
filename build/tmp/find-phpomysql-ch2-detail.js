const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch2-contract', 'ch2-abstract', 'ch2-difference', 'ch2-sealing', 'ch2-contracts'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});