var fs = require('fs');
var c=fs.readFileSync('AGENTS.md','utf8');
var lines=c.split('\n');
console.log('lines: '+lines.length);

// exactly one File Index header + one table
var hdr=lines.filter(l=>/^94 guides, 7744 topics/.test(l)).length;
console.log('new header lines: '+hdr);
var oldHdr=lines.filter(l=>/^\d+ pages, ~\d+ MB/.test(l)).length;
console.log('stale header lines: '+oldHdr);

// table row count: lines starting with "| `" 
var rows=lines.filter(l=>/^\| `[a-z0-9.-]+\.html` \|/.test(l));
console.log('file rows: '+rows.length);
var files=new Set(rows.map(l=>l.match(/`([^`]+)`/)[1]));
console.log('unique files: '+files.size);

// cross-check against disk
var NON=['index.html','topics.html','search.html','favorites.html'];
var disk=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
var missing=disk.filter(f=>!files.has(f));
var extra=[...files].filter(f=>!disk.includes(f));
console.log('on disk but not in index: '+(missing.length?missing.join(', '):'none'));
console.log('in index but not on disk: '+(extra.length?extra.join(', '):'none'));

// the hubs should NOT be in the table
['index.html','topics.html'].forEach(f=>{ if(files.has(f)) console.log('  hub listed as a guide: '+f); });

// markdown table integrity: the separator row must match the header columns
var i=lines.findIndex(l=>/^\| File \| Guide \| Chapters/.test(l));
if(i>=0){
  console.log('\nheader:  '+lines[i]);
  console.log('sep:     '+lines[i+1]);
  console.log('first:   '+lines[i+2]);
}