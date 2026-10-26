var fs = require('fs');

['flutter.html','package-publishing.html'].forEach(function(f) {
  var c = fs.readFileSync(f,'utf8');
  console.log('=== ' + f + ' ===');
  var band = (c.match(/<span class="am-band-s">([\s\S]*?)<\/span>/)||[])[1];
  console.log('  band: ' + band);
  console.log('  <div class="codeWrap"> (exact)      : ' + (c.match(/<div class="codeWrap">/g)||[]).length);
  console.log('  class="codeWrap" (any variant)      : ' + (c.match(/class="codeWrap[^"]*"/g)||[]).length);
  console.log('  <pre><code>                          : ' + (c.match(/<pre><code>/g)||[]).length);
  console.log('  <pre>                                : ' + (c.match(/<pre>/g)||[]).length);
  console.log('  </code></pre>                        : ' + (c.match(/<\/code><\/pre>/g)||[]).length);
  var variants = {};
  (c.match(/<div class="[^"]*codeWrap[^"]*"/g)||[]).forEach(function(v){ variants[v]=(variants[v]||0)+1; });
  console.log('  codeWrap class variants: ' + JSON.stringify(variants));
  console.log('');
});