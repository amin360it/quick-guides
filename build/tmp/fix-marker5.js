var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// 1. drop the trailing comma left by the marker
c = c.replace(/\*\(absent\)\*,\s*\|/g, '*(absent)* |');
c = c.replace(/\*\(absent\)\*,\s*--/g, '*(absent)* --');
c = c.replace(/\*\(absent\)\*,\s*\//g, '*(absent)* /');

// 2. grouped rows read better as one marker on the whole group
c = c.replace(/\| `toccheck\.js` \*\(absent\)\* \/ `navcheck\.js` \|/,
              '| `toccheck.js` / `navcheck.js` *(absent)* |');
c = c.replace(/\| `closefix\.js` \*\(absent\)\* \/ `dropstray\.js` \|/,
              '| `closefix.js` / `dropstray.js` *(absent)* |');

// 3. finalcheck and verifychtoc already say it in prose; drop the redundant tag
c = c.replace(/\| `finalcheck\.js` \*\(absent\)\* \| \*\*does not exist here\*\*/,
              '| `finalcheck.js` *(absent)* | **does not exist here**');

fs.writeFileSync(p,c,'utf8');

var lines=c.split('\n');
var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;

console.log('=== Verifiers table ===');
lines.slice(start,end).forEach(function(l){
  if(/^\|/.test(l)) console.log('  '+l.slice(0,105));
});
var bad=lines.slice(start,end).filter(function(l){
  return /absent/.test(l) && ((l.match(/\*\(absent\)\*/g)||[]).length!==1);
});
console.log('\nrows with a bad marker count: '+bad.length);