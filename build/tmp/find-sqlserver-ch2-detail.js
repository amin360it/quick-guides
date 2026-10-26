const fs = require('fs');
const s = fs.readFileSync('sqlserver.html', 'utf8');
['ch2-numeric', 'ch2-string', 'ch2-temporal', 'ch2-collation', 'ch2-conversion', 'ch2-cast'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});