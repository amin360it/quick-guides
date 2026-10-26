var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');
var lines=c.split('\n');

// Every row of the "## Verifiers" table names a script. Mark the ones that do
// not exist in build/ so the table stops implying they are enforced.
var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
if(start<0){ console.error('verifier table not found'); process.exit(1); }
var end=start+1;
while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;
console.log('verifier table lines '+(start+1)+'..'+end);

var MISSING=['finalcheck.js','seoverify.js','verifyhub.js','verifymodes.js','verifyradius.js',
             'verify.js','verifyscroll.js','verifywordmark.js','respcheck.js','contrast.js',
             'toccheck.js','navcheck.js','audit2.js','verifydoubled.js','codeesc.js',
             'depthcheck.js','veriflinks.js','tagcheck.js','mainopen.js','repeats.js',
             'closefix.js','dropstray.js'];
var checked=new Set(MISSING);
var marked=0;
for(var i=start;i<end;i++){
  var m=/^\| `([a-z0-9._-]+\.js)( --fix)?` \|/.exec(lines[i]);
  if(!m) continue;
  var name=m[1];
  var base=name.replace(/\.js$/,'');
  var real=['check-guide.js','check-codeesc.js','validate-fragment.js','fix-codeesc.js','stats.js','audit-guides.js'].indexOf(name)>=0;
  if(real) continue;
  if(!checked.has(name)) continue;
  if(/\*\*does not exist here\*\*/.test(lines[i])) continue;
  lines[i]=lines[i].replace('| `'+name, '| `'+name+'` *(absent)*').replace('`'+name+'`*(absent)*`','`'+name+'` *(absent)*');
  // simpler: mark the name cell
  lines[i]=lines[i].replace(/^\| `([a-z0-9._-]+\.js)/, '| `$1` *(absent)*');
  marked++;
}
fs.writeFileSync(p,lines.join('\n'),'utf8');
console.log('marked '+marked+' absent scripts');
lines.slice(start,end).forEach(function(l,i){
  if(/\*\(absent\)\*/.test(l)) console.log('  '+(start+1+i)+': '+l.slice(0,90));
});