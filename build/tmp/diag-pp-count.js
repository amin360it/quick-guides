var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');
console.log('<div class="codeWrap">          : ' + (c.split('<div class="codeWrap">').length-1));
console.log('<div class="codeWrap"><pre><code>: ' + (c.split('<div class="codeWrap"><pre><code>').length-1));
console.log('<pre>                            : ' + (c.split('<pre>').length-1));
console.log('<pre><code>                      : ' + (c.split('<pre><code>').length-1));
console.log('</code></pre>                    : ' + (c.split('</code></pre>').length-1));
console.log('</code></pre></div>              : ' + (c.split('</code></pre></div>').length-1));
console.log('');
// find codeWrap divs NOT immediately followed by <pre><code>
var re=/<div class="codeWrap">/g,m,bad=[];
while((m=re.exec(c))){
  var after=c.slice(m.index+m[0].length, m.index+m[0].length+12);
  if(after.indexOf('<pre><code>')!==0) bad.push({i:m.index, after:after});
}
console.log('codeWrap NOT followed by <pre><code>: '+bad.length);
bad.slice(0,10).forEach(function(b){ console.log('  @'+b.i+' -> '+JSON.stringify(b.after)); console.log('    ctx: '+JSON.stringify(c.slice(b.i-120,b.i+60))); });

// and any <pre> not preceded by codeWrap
var re2=/<pre>/g,bad2=[];
while((m=re2.exec(c))){
  var before=c.slice(Math.max(0,m.index-40),m.index);
  if(before.indexOf('codeWrap')<0) bad2.push({i:m.index, before:before});
}
console.log('\n<pre> without codeWrap before it: '+bad2.length);
bad2.slice(0,10).forEach(function(b){ console.log('  @'+b.i+' ctx: '+JSON.stringify(c.slice(b.i-100,b.i+60))); });