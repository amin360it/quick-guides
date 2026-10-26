var fs = require('fs');
var c = fs.readFileSync('react.html','utf8');
var i = 104868;
console.log('--- 500 chars before ---');
console.log(JSON.stringify(c.slice(i-500,i)));
console.log('\n--- 400 chars from the bad opener ---');
console.log(JSON.stringify(c.slice(i,i+400)));