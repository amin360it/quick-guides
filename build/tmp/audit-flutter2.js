var fs = require('fs');
var f='flutter.html';
var c=fs.readFileSync(f,'utf8');

// Every codeWrap div: does it open and close correctly?
var opens=(c.match(/<div class="codeWrap">/g)||[]).length;
var closes=(c.match(/<\/code><\/pre><\/div>/g)||[]).length;
console.log('codeWrap opens: '+opens+'  canonical closes: '+closes);

var preOpens=(c.match(/<pre><code>/g)||[]).length;
var codeCloses=(c.match(/<\/code><\/pre>/g)||[]).length;
console.log('<pre><code>: '+preOpens+'  </code></pre>: '+codeCloses);

// count ALL </div> that close a codeWrap
var allDivCloses=(c.match(/<\/div>/g)||[]).length;
console.log('all </div>: '+allDivCloses);

// Where do the 424 pre/code pairs live vs 396 divs?
// list every index of <pre><code> and the nearest preceding <div class="codeWrap">
var idxs=[]; var re=/<pre><code>/g,m;
while((m=re.exec(c))) idxs.push(m.index);
var re2=/<div class="codeWrap">/g; var divIdx=[]; 
while((m=re2.exec(c))) divIdx.push(m.index);
console.log('pre idx count '+idxs.length+' div idx count '+divIdx.length);

// for each pre, is there a div within 40 chars before it?
var orphan=[];
idxs.forEach(function(p){
  var found=false;
  for(var k=divIdx.length-1;k>=0;k--){ if(divIdx[k]<p){ found = (p-divIdx[k])<40; break; } }
  if(!found) orphan.push(p);
});
console.log('orphan <pre><code> (no codeWrap within 40 chars): '+orphan.length);
orphan.slice(0,10).forEach(function(p){ console.log('  at '+p+': '+JSON.stringify(c.slice(p-120,p+60))); });