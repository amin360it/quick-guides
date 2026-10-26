const fs = require('fs');
const s = fs.readFileSync('sqlserver.html', 'utf8');
['ch1-batches', 'ch1-identifiers', 'ch1-variables', 'ch1-types', 'ch1-flow', 'ch1-errors'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});