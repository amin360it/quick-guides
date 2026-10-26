var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'');

// A real violation is a hex used as a VALUE in a declaration, e.g.
//   color: #fff;   background: #123;
// Token definitions (--x: #fff;) are correct and required.
var bad=[];
[...css.matchAll(/\{([^{}]*)\}/g)].forEach(function(m){
  m[1].split(';').forEach(function(decl){
    var d=decl.trim();
    if(!d) return;
    // skip custom-property definitions
    if(/^--[a-z0-9-]+\s*:/.test(d)) return;
    if(/#[0-9a-fA-F]{3,8}\b/.test(d)) bad.push(d);
  });
});
var uniq=[...new Set(bad)];
console.log('declarations hard-coding a hex colour (non-token): '+uniq.length);
uniq.slice(0,25).forEach(d=>console.log('   '+d));