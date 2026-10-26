const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
['ch2-jsx', 'ch2-types', 'ch2-children', 'ch2-fragments', 'ch2-conditional', 'ch2-lists', 'ch2-refs-prop', 'ch2-contract'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});