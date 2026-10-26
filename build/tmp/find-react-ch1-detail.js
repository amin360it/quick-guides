const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
['ch1-declarative', 'ch1-elements', 'ch1-fiber', 'ch1-batching', 'ch1-keys-identity', 'ch1-strict'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});