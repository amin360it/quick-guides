var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');
var i = c.indexOf('// DEPRECATION, the lifecycle of a version');
console.log('anchor at ' + i);
console.log('--- 120 chars before, JSON-escaped ---');
console.log(JSON.stringify(c.slice(i-120, i+40)));