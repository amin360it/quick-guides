var fs = require('fs');
var path = 'package-publishing.html';
var c = fs.readFileSync(path, 'utf8');

var opens  = c.split('<div class="codeWrap"><pre><code>').length - 1;
var closes = c.split('</code></pre></div>').length - 1;
console.log('codeWrap openers : ' + opens);
console.log('canonical closes : ' + closes);
console.log('<pre><code>      : ' + (c.split('<pre><code>').length-1));
console.log('</code></pre>    : ' + (c.split('</code></pre>').length-1));
console.log('band             : ' + (c.match(/<span class="am-band-s">[\s\S]*?<\/span>/)||[])[0]);

// find the unbalanced region by walking open/close in order
var toks = [];
var re = /<div class="codeWrap"><pre><code>|<\/code><\/pre><\/div>/g, m;
while ((m = re.exec(c))) toks.push({ i: m.index, len: m[0].length, open: m[0][0] === '<' && m[0].indexOf('</') === -1 });
var depth = 0, anomalies = [];
toks.forEach(function(t, k) {
  if (t.open) depth++;
  else { depth--; if (depth < 0) { anomalies.push({ k:k, i:t.i, why:'close with depth 0' }); depth = 0; } }
});
console.log('\nfinal depth: ' + depth);
console.log('anomalies: ' + anomalies.length);
anomalies.slice(0,5).forEach(function(a){
  console.log('  at ' + a.i + ' (' + a.why + ')');
  console.log('  ctx: ' + JSON.stringify(c.slice(a.i-200, a.i+80)));
});