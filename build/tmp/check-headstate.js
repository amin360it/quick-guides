var fs = require('fs');
var files=fs.readdirSync('.').filter(function(f){return /\.html$/.test(f);});
var odd=[];
files.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var n=(c.match(/<meta name="theme-color"/g)||[]).length;
  var cs=(c.match(/<meta name="color-scheme"/g)||[]).length;
  if(n!==2||cs>1) odd.push(f+'  theme-color='+n+'  color-scheme='+cs);
});
console.log('files with unexpected head tags: '+odd.length);
odd.forEach(x=>console.log('  '+x));