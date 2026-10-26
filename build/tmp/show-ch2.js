var fs = require('fs');
var c = fs.readFileSync('idea-to-deploy.html','utf8');
var secs = c.match(/<section class="chapter">[\s\S]*?<\/section>/g) || [];
var sec = secs[2];   // chapter 2
console.log('--- full section 2 (' + sec.length + ' bytes) ---');
console.log(sec);