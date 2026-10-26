var fs = require('fs');
var files=['blazor.html','javascript.html','laravel-blade.html','sqlserver.html','ui-ux.html','winforms-wpf.html','wordpress.html','wp-plugin.html','wp-theme.html'];
var re=/&amp;(amp|lt|gt|quot|middot|nbsp|mdash);/g;
files.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var m, out=[];
  while((m=re.exec(c))){
    // is it inside a code block?
    var lastOpen=c.lastIndexOf('<div class="codeWrap"><pre><code>',m.index);
    var lastClose=c.lastIndexOf('</code></pre></div>',m.index);
    var inCode=lastOpen>lastClose;
    out.push({ ent:m[0], inCode:inCode, ctx:c.slice(Math.max(0,m.index-110),m.index+60).replace(/\n/g,'\\n') });
  }
  console.log('=== '+f+' ('+out.length+') ===');
  out.forEach(function(o){
    console.log('  '+(o.inCode?'[in code sample]':'[IN PROSE!!]')+'  '+o.ent);
    console.log('     '+o.ctx);
  });
  console.log('');
});