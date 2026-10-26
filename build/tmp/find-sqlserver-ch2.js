const fs = require('fs');
const s = fs.readFileSync('sqlserver.html', 'utf8');
const matches = s.match(/<h3 id="ch2-[^\"]*" data-toc>/g) || [];
matches.forEach(m => console.log(m));