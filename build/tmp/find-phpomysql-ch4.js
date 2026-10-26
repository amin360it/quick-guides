const fs = require('fs');
const s = fs.readFileSync('php-oop-mysql.html', 'utf8');
const matches = s.match(/<h3 id="ch4-[^\"]*" data-toc>/g) || [];
matches.forEach(m => console.log(m));