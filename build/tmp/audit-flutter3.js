var fs = require('fs');
var c=fs.readFileSync('flutter.html','utf8');

var pOpen=(c.match(/<p class="codeWrap">/g)||[]).length;
var divOpen=(c.match(/<div class="codeWrap">/g)||[]).length;
console.log('<p class="codeWrap">  : '+pOpen);
console.log('<div class="codeWrap">: '+divOpen);
console.log('</code></pre></p>    : '+(c.match(/<\/code><\/pre><\/p>/g)||[]).length);
console.log('</code></pre></div>  : '+(c.match(/<\/code><\/pre><\/div>/g)||[]).length);
console.log('');
// does CSS style .codeWrap generically or div.codeWrap?
var css=fs.readFileSync('assets/shell.css','utf8');
var rules=css.match(/[^\n{]*\.codeWrap[^\n]*\{/g)||[];
console.log('=== CSS selectors mentioning .codeWrap ===');
rules.slice(0,20).forEach(function(r){ console.log('  '+r.trim()); });