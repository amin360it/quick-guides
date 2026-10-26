const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch7-client', 'ch7-list', 'ch7-pagination'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});