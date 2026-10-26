var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');

var OPEN = '<div class="codeWrap"><pre><code>';
var CLOSE = '</code></pre></div>';

var toks = [];
var re = new RegExp(OPEN.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '|' + CLOSE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
var m;
while ((m = re.exec(c))) toks.push({ i: m.index, open: m[0] === OPEN });

// find the token index of the anomaly at 81206
var depth = 0;
for (var k=0;k<toks.length;k++){
  if (toks[k].open) depth++;
  else {
    depth--;
    if (depth < 0) {
      console.log('ORPHAN closer at token ' + k + ' offset ' + toks[k].i);
      console.log('\n--- context: 700 chars before ---');
      console.log(c.slice(toks[k].i-700, toks[k].i));
      console.log('\n--- 200 chars after ---');
      console.log(JSON.stringify(c.slice(toks[k].i, toks[k].i+200)));
      console.log('\n--- previous 4 tokens ---');
      for (var j=Math.max(0,k-4);j<=k;j++){
        console.log('  tok'+j+' '+(toks[j].open?'OPEN ':'CLOSE')+' @'+toks[j].i);
      }
      break;
    }
  }
}