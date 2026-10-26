var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8').replace(/\/\*[\s\S]*?\*\//g,'');
// the real base palette: tokens declared in BOTH :root and html[data-theme="dark"]
function blk(sel){
  var i=css.indexOf(sel); if(i<0) return '';
  var o=css.indexOf('{',i),d=1,j=o+1;
  while(j<css.length&&d>0){ if(css[j]==='{')d++; else if(css[j]==='}')d--; j++; }
  return css.slice(o+1,j-1);
}
function toks(b){var t=[];b.split(';').forEach(function(s){var m=s.match(/^\s*(--[a-z0-9-]+)\s*:/);if(m)t.push(m[1]);});return t;}
var L=toks(blk(':root{')), D=toks(blk('html[data-theme="dark"]'));
var palette=L.filter(t=>D.indexOf(t)>=0).sort();
console.log('base palette tokens (in BOTH :root and dark): '+palette.length);
var nonPalette=L.filter(t=>D.indexOf(t)<0).sort();
console.log('non-palette tokens in :root only: '+nonPalette.length+' -> '+nonPalette.join(', '));

// every palette block must declare exactly the palette set, no more, no less
var re=/html\[data-mode="[a-z]+"\](\s*\[data-theme="(light|dark)"\])?\s*\{/g,m,bad=0;
while((m=re.exec(css))){
  var o=css.indexOf('{',m.index+m[0].length-1),d=1,j=o+1;
  while(j<css.length&&d>0){ if(css[j]==='{')d++; else if(css[j]==='}')d--; j++; }
  var T=toks(css.slice(o+1,j-1));
  var miss=palette.filter(t=>T.indexOf(t)<0), extra=T.filter(t=>palette.indexOf(t)<0);
  if(miss.length||extra.length){ bad++; console.log('  '+m[0].replace(/\s*\{$/,'')+' missing['+miss+'] extra['+extra+']'); }
}
console.log('\npalette blocks not matching the base palette set exactly: '+bad+' (expect 0)');