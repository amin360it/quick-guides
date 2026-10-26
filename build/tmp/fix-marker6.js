var fs = require('fs');
var p='AGENTS.md';
var lines=fs.readFileSync(p,'utf8').split('\n');

var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1; while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;

// Rows that are missing a marker: the name cell ends with .js (or .js --fix)
// and is immediately followed by the pipe, i.e. "| `seoverify.js |".
var NEED=['seoverify.js','verifyhub.js','verifymodes.js','verifyradius.js','verify.js',
  'verifyscroll.js','verifywordmark.js','respcheck.js','contrast.js','audit2.js',
  'verifydoubled.js','codeesc.js','depthcheck.js','veriflinks.js','tagcheck.js',
  'mainopen.js','repeats.js'];

var fixed=0;
for(var i=start;i<end;i++){
  var l=lines[i];
  if(!/^\| /.test(l)) continue;
  if(/\*\(absent\)\*/.test(l)) continue;
  for(var k=0;k<NEED.length;k++){
    var n=NEED[k];
    // match the un-marked form: | `name.js |  or | `name.js <file>` |
    var re=new RegExp('^\\| `'+n.replace(/\./g,'\\.')+'(?= \\||`)');
    if(re.test(l)){
      lines[i]=l.replace(/^(\| `[^`]+`)/, '$1 *(absent)*');
      fixed++;
      break;
    }
  }
}
fs.writeFileSync(p,lines.join('\n'),'utf8');
console.log('restored '+fixed+' markers');

var out=fs.readFileSync(p,'utf8').split('\n');
console.log('\n=== table ===');
out.slice(start,end).forEach(function(l){ if(/^\|/.test(l)) console.log('  '+l.slice(0,92)); });
var unmarked=out.slice(start,end).filter(function(l){
  return /^\| `[a-z0-9._-]+\.js/.test(l) && !/\*\(absent\)\*/.test(l);
});
console.log('\nrows still unmarked: '+unmarked.length);