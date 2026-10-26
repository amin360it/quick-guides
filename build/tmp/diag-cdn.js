var fs = require('fs');
var CDN=/(cdn\.jsdelivr|unpkg\.com|cdnjs\.cloudflare|fonts\.googleapis|fonts\.gstatic|ajax\.googleapis|stackpath\.bootstrapcdn)/i;
['alpinejs.html','axios.html','bootstrap5.html','fontawesome-icons.html','idea-to-deploy.html','package-publishing.html'].forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var m;
  while((m=CDN.exec(c))){
    var lo=Math.max(0,m.index-200);
    var seg=c.slice(lo, m.index+90);
    var lastOpen=c.lastIndexOf('<div class="codeWrap"><pre><code>', m.index);
    var lastClose=c.lastIndexOf('</code></pre></div>', m.index);
    console.log(f+' @'+m.index+'  inCodeSample='+(lastOpen>lastClose));
  }
});