var fs = require('fs');

var f='flutter.html';
var c=fs.readFileSync(f,'utf8');
// find <pre><code> occurrences NOT preceded by codeWrap div
var re=/<pre><code>/g, m, n=0;
while((m=re.exec(c))){
  n++;
  var before=c.slice(Math.max(0,m.index-160),m.index);
  if(before.indexOf('codeWrap')<0){
    console.log('--- unwrapped #'+n+' at '+m.index+' ---');
    console.log(JSON.stringify(before.slice(-150)));
  }
}
console.log('total pre><code>: '+n);