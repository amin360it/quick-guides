var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');
// after the close at 79297 up to the orphan close at 81206
console.log(c.slice(79297, 81500));