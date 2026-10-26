const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch3-view-text', 'ch3-image', 'ch3-scroll', 'ch3-press', 'ch3-semantics'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});