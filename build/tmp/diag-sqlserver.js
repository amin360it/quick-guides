var fs = require('fs');
var c = fs.readFileSync('sqlserver.html','utf8');
var re=/&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g,m;
while((m=re.exec(c))){
  var lastOpen=c.lastIndexOf('<div class="codeWrap"><pre><code>',m.index);
  var lastClose=c.lastIndexOf('</code></pre></div>',m.index);
  console.log('--- ' + m[0] + ' @' + m.index + ' (inSample=' + (lastOpen>lastClose) + ') ---');
  console.log(JSON.stringify(c.slice(Math.max(0,m.index-500), m.index+400)));
  console.log('');
}