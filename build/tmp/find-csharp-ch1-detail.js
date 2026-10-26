const fs = require('fs');
const s = fs.readFileSync('csharp.html', 'utf8');
['ch1-first', 'ch1-project', 'ch1-cli', 'ch1-toplevel', 'ch1-csproj', 'ch1-config'].forEach(id => {
  const idx = s.indexOf('<h3 id="' + id + '"');
  if (idx !== -1) {
    console.log('Found:', id, 'at', idx);
    console.log('Context:', s.substring(idx, idx + 100));
  } else {
    console.log('Not found:', id);
  }
});