var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');
var needle = 'class="codeWrap"';
var idx = [], p = 0;
while ((p = c.indexOf(needle, p)) !== -1) { idx.push(p); p++; }
console.log('class="codeWrap" occurrences: ' + idx.length);
idx.forEach(function(i){
  var seg = c.slice(i, i+30);
  if (seg.indexOf('<div class="codeWrap"><pre><code>') !== 0) {
    console.log('NON-CANONICAL @'+i+': '+JSON.stringify(seg));
    console.log('   ctx: '+JSON.stringify(c.slice(Math.max(0,i-150), i+80)));
  }
});