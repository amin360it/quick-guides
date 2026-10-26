const fs = require('fs');
const s = fs.readFileSync('bootstrap5.html', 'utf8');
const matches = s.match(/<h3 id="ch8-[^"]*" data-toc>/g) || [];
matches.forEach(m => console.log(m));