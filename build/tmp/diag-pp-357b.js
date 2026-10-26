var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');

var OPEN = '<div class="codeWrap"><pre><code>';
var CLOSE = '</code></pre></div>';
var target = 34557;

// is the odd match inside a canonical code block?
var lastOpen = c.lastIndexOf(OPEN, target);
var lastClose = c.lastIndexOf(CLOSE, target);
console.log('last opener before target : ' + lastOpen);
console.log('last closer before target : ' + lastClose);
console.log('inside a code block       : ' + (lastOpen > lastClose));

// show the whole block
var end = c.indexOf(CLOSE, target);
console.log('\n--- full block (decoded) ---');
var body = c.slice(lastOpen + OPEN.length, end);
console.log(body.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));
console.log('\n--- raw first 300 of block ---');
console.log(JSON.stringify(body.slice(0,300)));

// count real blocks the robust way: opener tag that is immediately followed by <pre><code>
var real = 0, p = 0;
while ((p = c.indexOf(OPEN, p)) !== -1) { real++; p += OPEN.length; }
console.log('\nTRUE code blocks (opener immediately + <pre><code>): ' + real);