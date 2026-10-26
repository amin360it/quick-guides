var fs = require('fs');
var cases=[['fontawesome-icons.html','file.svg#id'],['html.html','a.png'],['html.html','/app/'],['html.html','logo.svg'],['software-engineering.html','file.js'],['vuejs.html','"value"'],['wp-theme.html','VALUE']];
cases.forEach(function(p){
  var f=p[0], needle=p[1];
  var c=fs.readFileSync(f,'utf8');
  // find as a tag attribute href="..."
  var re=new RegExp('href="'+needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'"','g');
  var m=re.exec(c);
  if(!m){ console.log(f+' :: '+needle+'  (not an href= attr)'); return; }
  var lo=Math.max(0,m.index-300), hi=Math.min(c.length,m.index+160);
  var seg=c.slice(lo,hi);
  var lastOpen=seg.lastIndexOf('<div class="codeWrap"><pre><code>');
  var lastClose=seg.lastIndexOf('</code></pre></div>');
  console.log('=== '+f+' :: '+needle+' ===');
  console.log('   ...'+JSON.stringify(seg.slice(-260)));
  console.log('');
});