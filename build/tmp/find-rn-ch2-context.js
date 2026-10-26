const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
['ch2-choices', 'ch2-project', 'ch2-native', 'ch2-devices', 'ch2-decide'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});