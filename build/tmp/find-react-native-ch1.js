const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
const matches = s.match(/<h3 id="ch1-[^"]*" data-toc>/g) || [];
matches.forEach(m => console.log(m));