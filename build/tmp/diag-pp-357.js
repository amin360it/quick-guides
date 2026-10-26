var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');
var i = 34557;
// the odd match starts with <code> then the literal text class="codeWrap"
var seg = c.slice(i-20, i+220);
console.log(JSON.stringify(seg));
console.log('');
console.log('--- decoded ---');
console.log(seg.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));