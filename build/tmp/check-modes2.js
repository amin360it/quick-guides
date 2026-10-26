var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'');

// Count top-level rules whose selector mentions data-mode.
var i=0,count=0,sel=[];
while(i<css.length){
  var open=css.indexOf('{',i);
  if(open<0) break;
  var s=css.slice(i,open).trim();
  // only consider a selector (no braces inside)
  if(s.indexOf('}')<0 && /data-mode/.test(s) && !/\}\s*$/.test(s)){
    // find matching close
    var depth=1,j=open+1;
    while(j<css.length&&depth>0){ if(css[j]==='{')depth++; else if(css[j]==='}')depth--; j++; }
    var body=css.slice(open+1,j-1);
    if(/--(bg|text)\s*:/.test(body) && /--(brand|accent)\s*:/.test(body)){
      count++; sel.push(s.replace(/\s+/g,' ').slice(0,90));
    }
    i=j;
  } else i=open+1;
}
console.log('palette blocks declaring bg+text+brand/accent: '+count+' (expect 20)');
sel.forEach(s=>console.log('   '+s));

// also confirm base :root and dark exist and are correct
var rootM=css.match(/(:root|html\s*\{)\s*\{([\s\S]*?)\n\s*\}/);
console.log('\nbase light block found: '+(css.indexOf(':root')>=0));
console.log('dark block found      : '+/html\[data-theme="dark"\]/.test(css));