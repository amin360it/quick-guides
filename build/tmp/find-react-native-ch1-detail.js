const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch1-what', 'ch1-host', 'ch1-thread', 'ch1-render', 'ch1-compile'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});