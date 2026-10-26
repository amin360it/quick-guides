const fs = require('fs');
const s = fs.readFileSync('react-native.html', 'utf8');
const matches = s.match(/<h3 id="[^"]*" data-toc>/g) || [];
matches.slice(0, 15).forEach(m => console.log(m));