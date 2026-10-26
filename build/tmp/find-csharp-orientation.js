const fs = require('fs');
const s = fs.readFileSync('csharp.html', 'utf8');
const matches = s.match(/<h3 id="orientation-[^\"]*" data-toc>/g) || [];
matches.forEach(m => console.log(m));