var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// undo the mangled marker, then apply exactly one
c = c.replace(/\*\(absent\)\*` \*\(absent\)\*/g, '*(absent)*');
fs.writeFileSync(p, c, 'utf8');

var lines=c.split('\n');
var fixed=0;
lines.forEach(function(l,i){
  if(/\*\(absent\)\*/.test(l)){
    var out=l.replace(/^\| `([a-z0-9._-]+\.js)`,?/, '| `$1` *(absent)*');
    if(out!==l){ lines[i]=out; fixed++; }
  }
});
fs.writeFileSync(p,lines.join('\n'),'utf8');
console.log('normalised '+fixed+' rows');
lines.filter(function(l){return /absent/.test(l);}).forEach(function(l){ console.log('  '+l.slice(0,110)); });