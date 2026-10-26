var fs = require('fs');
var c = fs.readFileSync('rust-programming.html', 'utf8');
var i = c.indexOf('ch-toc');
console.log('first ch-toc at ' + i);
console.log(JSON.stringify(c.slice(i - 200, i + 900)));
