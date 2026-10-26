const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch3-trait', 'ch3-conflict', 'ch3-composition', 'ch3-wrong', 'ch3-aggregate'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});