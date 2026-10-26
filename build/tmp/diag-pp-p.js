var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');

function n(s){ return c.split(s).length - 1; }
console.log('<div class="codeWrap">            :', n('<div class="codeWrap">'));
console.log('<div class="codeWrap"><pre><code> :', n('<div class="codeWrap"><pre><code>'));
console.log('<p class="codeWrap">               :', n('<p class="codeWrap">'));
console.log('class="codeWrap" (bare count)     :', n('class="codeWrap"'));
console.log('</code></pre></div></p>            :', n('</code></pre></div></p>'));
console.log('</code></pre></p>                 :', n('</code></pre></p>'));
console.log('');
// Where does class="codeWrap" appear NOT as <div class="codeWrap"> ?
var idx=[],p=0;
while((p=c.indexOf('class="codeWrap"',p))!==-1){ idx.push(p); p++; }
idx.forEach(function(i){
  var start=c.lastIndexOf('<',i);
  var tag=c.slice(start, start+22);
  if(tag!=='<div class="codeWrap">') console.log('  odd tag @'+i+': '+JSON.stringify(tag));
});
console.log('odd tags checked: '+idx.length);
console.log('');
// stray </p> right after a codeWrap close
var re=/<\/code><\/pre><\/div><\/p>/g,m;
while((m=re.exec(c))){ console.log('STRAY </p> @'+m.index+': '+JSON.stringify(c.slice(m.index-90,m.index+40))); }