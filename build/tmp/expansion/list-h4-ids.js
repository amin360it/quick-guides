const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');
const start = html.indexOf('<h2 id="orientation"');
const end = html.indexOf('<h2 id="ch6"');
const region = html.slice(start, end);
const ids = [...region.matchAll(/<h4 id="([^"]+)"/g)].map((m) => m[1]);
console.log('total h4 ids added:', ids.length);
console.log(ids.join('\n'));