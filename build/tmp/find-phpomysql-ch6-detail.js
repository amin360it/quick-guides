const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch6-hierarchy', 'ch6-design', 'ch6-finally', 'ch6-boundary', 'ch6-suppression'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});