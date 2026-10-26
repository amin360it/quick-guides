const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
['ch1-declaration', 'ch1-promotion', 'ch1-readonly', 'ch1-final', 'ch1-enums'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});