var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// The mangled rows read:  | `name.js` *(absent)* *(absent)*` |
// Replace that whole run with a single clean marker.
var before=c;
c = c.replace(/`\s*\*\(absent\)\*\s*\*\(absent\)\*\s*`/g, '*(absent)*');

fs.writeFileSync(p,c,'utf8');
console.log('changed: '+(before!==c));

var lines=c.split('\n');
var stillBad=lines.filter(function(l){ return (l.match(/\*\(absent\)\*/g)||[]).length!==1 && /absent/.test(l); });
console.log('rows with a wrong marker count: '+stillBad.length);
stillBad.forEach(function(l){ console.log('  '+l.slice(0,110)); });
console.log('\nfinal marked rows:');
lines.filter(function(l){ return /\*\(absent\)\*/.test(l); }).forEach(function(l){ console.log('  '+l.slice(0,95)); });