var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// Two cells lost their closing backtick in the earlier passes. Restore them.
c = c.replace('| `seoverify.js | SEO:', '| `seoverify.js` | SEO:');
c = c.replace('| `codeesc.js` --fix` |', '| `codeesc.js --fix` |');

fs.writeFileSync(p,c,'utf8');

var lines=c.split('\n');
var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;

// integrity: every row must be exactly two cells, first cell fully backticked
var bad=[];
lines.slice(start,end).forEach(function(l){
  if(!/^\|/.test(l)) return;
  var cells=l.split('|');
  if(cells.length!==4) bad.push('cell count '+cells.length+': '+l.slice(0,70));
  else if(!/^`[^`]+`$/.test(cells[1].trim())) bad.push('bad name cell: '+JSON.stringify(cells[1]));
});
console.log('malformed rows: '+bad.length);
bad.forEach(function(b){ console.log('  '+b); });
console.log('');
lines.slice(start,end).forEach(function(l){ if(/^\|/.test(l)) console.log('  '+l.slice(0,90)); });