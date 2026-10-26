const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch5-value', 'ch5-entity', 'ch5-mapper', 'ch5-anemic', 'ch5-invariants'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});