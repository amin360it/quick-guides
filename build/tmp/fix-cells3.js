var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// the mangled form is exactly: | ``name.js ` |
// replace with:            | `name.js` |
var before=c;
c = c.replace(/\| ``([a-z0-9._-]+) ` \|/g, '| `$1` |');

fs.writeFileSync(p,c,'utf8');
console.log('rows repaired: '+((before.match(/\| ``[a-z0-9._-]+ ` \|/g)||[]).length));

var lines=c.split('\n');
var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;

var bad=[];
lines.slice(start,end).forEach(function(l){
  if(!/^\|/.test(l)) return;
  var cells=l.split('|');
  if(cells.length!==4) return;
  var n=cells[1].trim();
  if(n==='Script'||/^-+$/.test(n)) return;
  if(/``/.test(n)) bad.push('double backtick: '+JSON.stringify(n));
  if((n.match(/`/g)||[]).length%2!==0) bad.push('unbalanced: '+JSON.stringify(n));
});
console.log('remaining name-cell problems: '+bad.length);
bad.forEach(function(b){ console.log('  '+b); });
console.log('');
lines.slice(start,end).forEach(function(l){ if(/^\|/.test(l)) console.log('  '+l.slice(0,84)); });