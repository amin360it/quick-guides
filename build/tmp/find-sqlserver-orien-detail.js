const fs = require('fs');
const s = fs.readFileSync('sqlserver.html', 'utf8');
['orientation-versions', 'orientation-lifecycle', 'orientation-preview', 'orientation-tooling', 'orientation-conventions'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});