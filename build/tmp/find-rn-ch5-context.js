const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch5-render', 'ch5-colocate', 'ch5-context', 'ch5-reducer', 'ch5-server'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});