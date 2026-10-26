var fs = require('fs');
var c=fs.readFileSync('AGENTS.md','utf8');
var lines=c.split('\n');
var probs=[];

// 1. markdown tables: every row must have a consistent cell count
var i=0, tbl=0;
while(i<lines.length){
  if(/^\|/.test(lines[i])){
    var start=i, counts={};
    while(i<lines.length && /^\|/.test(lines[i])){ counts[lines[i].split('|').length]=(counts[lines[i].split('|').length]||0)+1; i++; }
    var keys=Object.keys(counts);
    if(keys.length>1) probs.push('table at line '+(start+1)+' has mixed cell counts '+JSON.stringify(counts));
    else tbl++;
  } else i++;
}
console.log('markdown tables: '+tbl);

// 2. stray markers anywhere
var stray=c.match(/``/g);
console.log('double backticks: '+(stray?stray.length:0));
if(stray) lines.forEach(function(l,n){ if(/``/.test(l)) probs.push('line '+(n+1)+': '+l.slice(0,80)); });

// 3. unbalanced markers
lines.forEach(function(l,n){ if(/\*\(absent\)\*/.test(l)) probs.push('leftover marker line '+(n+1)); });

// 4. every ``` fence balanced
var fences=(c.match(/^```/gm)||[]).length;
console.log('code fences: '+fences+' ('+(fences%2===0?'balanced':'UNBALANCED')+')');
if(fences%2) probs.push('unbalanced code fences');

// 5. no empty table cells in the file index
var rows=lines.filter(function(l){ return /^\| `[a-z0-9.-]+\.html` \|/.test(l); });
var emptyCell=rows.filter(function(l){ return /\|\s*\|\s*\|/.test(l) || /\|\s*\|/.test(l.slice(-3)); });
console.log('file-index rows: '+rows.length+'  with an empty cell: '+emptyCell.length);

console.log('\nproblems: '+probs.length);
[...new Set(probs)].slice(0,25).forEach(function(p){ console.log('  '+p); });
console.log('\ntotal lines: '+lines.length);