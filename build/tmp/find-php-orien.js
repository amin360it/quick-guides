const fs = require('fs');
const s = fs.readFileSync('php.html', 'utf8');
['orientation-versions', 'orientation-execution', 'orientation-tooling', 'orientation-signatures', 'orientation-conventions'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});