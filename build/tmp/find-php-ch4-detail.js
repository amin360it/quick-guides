const fs = require('fs');
const s = fs.readFileSync('php.html', 'utf8');
['ch4-namespaces', 'ch4-imports', 'ch4-psr4', 'ch4-composer', 'ch4-psr', 'ch4-scripts'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});