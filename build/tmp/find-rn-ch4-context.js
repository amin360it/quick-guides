const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch4-objects', 'ch4-flex', 'ch4-density', 'ch4-responsive', 'ch4-theme'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});