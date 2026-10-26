const fs = require('fs');
const s = fs.readFileSync('php.html', 'utf8');
['ch1-statements', 'ch1-switch-match', 'ch1-variables', 'ch1-types', 'ch1-strings', 'ch1-arrays'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});