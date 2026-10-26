const fs = require('fs');
const s = fs.readFileSync('php.html', 'utf8');
['ch3-declaration', 'ch3-construction', 'ch3-members', 'ch3-hooks', 'ch3-inheritance', 'ch3-composition'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});