var fs = require('fs');
var c = fs.readFileSync('idea-to-deploy.html','utf8');
var secs = c.match(/<section class="chapter">[\s\S]*?<\/section>/g) || [];
console.log('sections: ' + secs.length);

secs.forEach(function(sec, i) {
  var h2 = (sec.match(/<h2 id="([^"]+)"/) || [])[1];
  var h2t = (sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
  var h3s = [...sec.matchAll(/<h3 id="([^"]+)"[^>]*data-toc>/g)].map(function(m){ return m[1]; });
  var toc = sec.match(/<div class="ch-toc-list">([\s\S]*?)<\/div>/);
  var links = toc ? [...toc[1].matchAll(/href="#([^"]+)"/g)].map(function(m){ return m[1]; }) : [];
  var bad = links.filter(function(l){ return h3s.indexOf(l) < 0; });
  console.log('--- section ' + (i+1) + ' id=' + h2 + '  "' + (h2t||'').replace(/<[^>]*>/g,'') + '"');
  console.log('    h3s: ' + h3s.length + '   toc links: ' + links.length);
  if (bad.length) console.log('    *** TOC POINTS AT: ' + bad.join(', '));
});