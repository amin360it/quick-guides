const fs = require('fs');
const s = fs.readFileSync('sqlserver.html', 'utf8');
['ch3-ddl', 'ch3-pk', 'ch3-unique', 'ch3-fk', 'ch3-identity', 'ch3-objects'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});