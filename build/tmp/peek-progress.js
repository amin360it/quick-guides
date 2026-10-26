var fs = require('fs');
var c = fs.readFileSync('rust-programming.html', 'utf8');

var i = c.indexOf('progressBar');
console.log('progressBar ctx: ' + JSON.stringify(c.slice(Math.max(0, i - 300), i + 200)));

i = c.indexOf('id="toTop"');
console.log('\ntoTop ctx: ' + JSON.stringify(c.slice(Math.max(0, i - 150), i + 500)));
