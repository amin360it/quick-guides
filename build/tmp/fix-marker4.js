var fs = require('fs');
var p='AGENTS.md';
var lines=fs.readFileSync(p,'utf8').split('\n');

// Rebuild every row of the "## Verifiers" table from a known-good spec, so the
// markup is exactly right rather than patched until it looks right.
var ABSENT = ['finalcheck.js','seoverify.js','verifyhub.js','verifymodes.js','verifyradius.js',
  'verify.js','verifyscroll.js','verifywordmark.js','respcheck.js','contrast.js',
  'toccheck.js','navcheck.js','audit2.js','verifydoubled.js','codeesc.js','depthcheck.js',
  'veriflinks.js','tagcheck.js','mainopen.js','repeats.js','closefix.js','dropstray.js',
  'verifychtoc.js'];

var start=lines.findIndex(function(l){ return l.trim()==='## Verifiers'; });
var end=start+1;
while(end<lines.length && !/^#{1,3} /.test(lines[end])) end++;
console.log('table spans lines '+(start+1)+'..'+end);

// strip every existing marker so we start from a clean slate
for(var i=start;i<end;i++){
  lines[i]=lines[i].replace(/\s*\*\(absent\)\*/g,'').replace(/`{2,}/g,'`');
}
fs.writeFileSync(p,lines.join('\n'),'utf8');

// now add exactly one marker per absent script
var changed=0;
for(i=start;i<end;i++){
  var m=/^\| `([a-z0-9._-]+\.js)/.exec(lines[i]);
  if(!m) continue;
  if(ABSENT.indexOf(m[1])<0) continue;
  lines[i]=lines[i].replace(/^\| `([a-z0-9._-]+\.js)`,?/, '| `$1` *(absent)*,');
  changed++;
}
fs.writeFileSync(p,lines.join('\n'),'utf8');
console.log('marked '+changed);

var out=fs.readFileSync(p,'utf8').split('\n');
var probs=[];
for(i=start;i<end;i++){
  var cnt=(out[i].match(/\*\(absent\)\*/g)||[]).length;
  if(cnt>1) probs.push('duplicate marker: '+out[i].slice(0,90));
  if(/`{2,}/.test(out[i])) probs.push('double backtick: '+out[i].slice(0,90));
  if(/\|\s*\|/.test(out[i])) probs.push('empty cell: '+out[i].slice(0,90));
}
console.log('malformed rows: '+probs.length);
probs.forEach(function(x){ console.log('  '+x); });
console.log('\nresult:');
out.slice(start,end).forEach(function(l){ if(/absent/.test(l)) console.log('  '+l.slice(0,88)); });