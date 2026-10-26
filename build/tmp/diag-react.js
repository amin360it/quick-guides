var fs = require('fs');
var c = fs.readFileSync('react.html','utf8');
function n(s){return c.split(s).length-1;}
console.log('naive class="codeWrap"      :', n('class="codeWrap"'));
console.log('TRUE opener+<pre><code>     :', n('<div class="codeWrap"><pre><code>'));
console.log('<div class="codeWrap">      :', n('<div class="codeWrap">'));
console.log('<pre><code>                :', n('<pre><code>'));
console.log('</code></pre></div>        :', n('</code></pre></div>'));
console.log('band                        :', (c.match(/<span class="am-band-s">[\s\S]*?<\/span>/)||[])[0]);
console.log('');
// codeWrap divs NOT immediately followed by <pre><code>
var re=/<div class="codeWrap">/g,m,bad=[];
while((m=re.exec(c))){ if(c.slice(m.index+21,m.index+21+11)!=='<pre><code>') bad.push(m.index); }
console.log('codeWrap not followed by <pre><code>: '+bad.length);
bad.slice(0,6).forEach(function(i){ console.log('  @'+i+': '+JSON.stringify(c.slice(i,i+90))); });
console.log('');
// <pre> without a codeWrap opener before it
var re2=/<pre>/g,bad2=[];
while((m=re2.exec(c))){ if(c.slice(Math.max(0,m.index-40),m.index).indexOf('codeWrap')<0) bad2.push(m.index); }
console.log('<pre> with no codeWrap within 40 chars: '+bad2.length);
bad2.slice(0,6).forEach(function(i){ console.log('  @'+i+': '+JSON.stringify(c.slice(Math.max(0,i-160),i+90))); });