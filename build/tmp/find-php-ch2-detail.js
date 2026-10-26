const fs = require('fs');
const s = fs.readFileSync('php.html', 'utf8');
['ch2-signatures', 'ch2-parameters', 'ch2-scope', 'ch2-callables', 'ch2-errors', 'ch2-attributes'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});