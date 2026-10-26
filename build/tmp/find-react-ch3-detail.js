const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
['ch3-twowhat', 'ch3-process', 'ch3-sametype', 'ch3-changetype', 'ch3-hydration', 'ch3-reconcile-cost', 'ch3-concurrent'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});