const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch7-iterator', 'ch7-generator', 'ch7-lazy', 'ch7-pipeline', 'ch7-materialise'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});