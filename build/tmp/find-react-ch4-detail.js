const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
['ch4-phases', 'ch4-render-twice', 'ch4-rerender', 'ch4-commit', 'ch4-mount-effect', 'ch4-strict-cleanup', 'ch4-unmount'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});