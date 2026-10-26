var fs = require('fs');
var c = fs.readFileSync('package-publishing.html','utf8');

// Any code closer that is NOT the canonical one?
var pats = [
  '</code></pre></div>',
  '</code></pre></p>',
  '</code>\n</pre>',
  '</code></pre>',
  '</pre></div>',
  '</code></pre></section>',
  '</code></div>',
  '</pre>'
];
console.log('=== closer variants ===');
pats.forEach(function(p){ console.log('  ' + JSON.stringify(p) + ' : ' + (c.split(p).length-1)); });

// Find <pre> that are not preceded by the canonical opener
var idx=[]; var re=/<pre>/g,m;
while((m=re.exec(c))) idx.push(m.index);
console.log('\n<pre> count: '+idx.length);
idx.forEach(function(p){
  var before=c.slice(Math.max(0,p-60),p);
  if(before.indexOf('<div class="codeWrap">')<0){
    console.log('  NON-canonical <pre> at '+p+': '+JSON.stringify(before.slice(-60)));
  }
});

// look for a stray literal
var stray=[]; var re2=/<\/code>/g;
while((m=re2.exec(c))) stray.push(m.index);
console.log('\n</code> count: '+stray.length);
console.log('</code></pre></div> count: '+(c.split('</code></pre></div>').length-1));