var fs = require('fs');
var p='AGENTS.md';
var lines=fs.readFileSync(p,'utf8').split('\n');

var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;

var fixed=0;
for(var i=start;i<end;i++){
  var l=lines[i];
  if(!/^\| `/.test(l)) continue;
  var bar=l.indexOf('|',1);           // end of the name cell
  if(bar<0) continue;
  var nameCell=l.slice(2,bar);         // between the first backtick and the pipe
  // if the name cell has an odd number of backticks, one is missing
  var ticks=(nameCell.match(/`/g)||[]).length;
  if(ticks%2===1){
    lines[i]='| `'+nameCell+'` |'+l.slice(bar+1);
    fixed++;
  }
}
fs.writeFileSync(p,lines.join('\n'),'utf8');
console.log('closed '+fixed+' name cells');

// verify
var out=fs.readFileSync(p,'utf8').split('\n');
var bad=[];
out.slice(start,end).forEach(function(l){
  if(!/^\|/.test(l)) return;
  var cells=l.split('|');
  if(cells.length!==4) return;         // header + separator rows
  var n=cells[1].trim();
  if(n==='Script'||/^-+$/.test(n)) return;
  if((n.match(/`/g)||[]).length%2!==0) bad.push('unbalanced: '+JSON.stringify(n));
  if(!/^`/.test(n)) bad.push('no leading backtick: '+JSON.stringify(n));
});
console.log('unbalanced name cells: '+bad.length);
bad.forEach(function(b){ console.log('  '+b); });
console.log('');
out.slice(start,end).forEach(function(l){ if(/^\|/.test(l)) console.log('  '+l.slice(0,86)); });