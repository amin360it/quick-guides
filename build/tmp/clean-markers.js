var fs = require('fs');
var p='AGENTS.md';
var lines=fs.readFileSync(p,'utf8').split('\n');

var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;
console.log('table lines '+(start+1)+'..'+end);

// 1. remove EVERY marker and restore any mangled cell
for(var i=start;i<end;i++){
  lines[i]=lines[i].replace(/\s*\*\(absent\)\*/g,'');
}
fs.writeFileSync(p,lines.join('\n'),'utf8');

// 2. rewrite the two cells that got mangled by earlier passes
var c=fs.readFileSync(p,'utf8');
c=c.replace('across ` *(absent)*modes.js`','across `modes.js`');
c=c.replace('the ` *(absent)*border-radius`','the `border-radius`');
c=c.replace('fallbacks, ` *(absent)*@supports` guard','fallbacks, `@supports` guard');
c=c.replace('a ` *(absent)*</td>` where','a `</td>` where');
c=c.replace('closes its ` *(absent)*<main id="content">`','closes its `<main id="content">`');
fs.writeFileSync(p,c,'utf8');

console.log('\ncleaned cells');
fs.readFileSync(p,'utf8').split('\n').slice(start,end).forEach(function(l){
  if(/^\|/.test(l)) console.log('  '+l.slice(0,96));
});