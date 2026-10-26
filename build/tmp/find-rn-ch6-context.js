const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch6-stack', 'ch6-params', 'ch6-tabs', 'ch6-auth', 'ch6-deep'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});