var fs = require('fs');
var raw=fs.readFileSync('assets/shell.css','utf8');
var css=raw.replace(/\/\*[\s\S]*?\*\//g,'');

function blockAt(startOpen){
  var depth=1,j=startOpen+1;
  while(j<css.length&&depth>0){ if(css[j]==='{')depth++; else if(css[j]==='}')depth--; j++; }
  return { body: css.slice(startOpen+1,j-1), end: j };
}
// base :root at line 36
var rootStart=css.indexOf(':root{');
var rootBlk=blockAt(rootStart);
function toks(body){var t=[];body.split(';').forEach(function(d){var m=d.match(/^\s*(--[a-z0-9-]+)\s*:/);if(m)t.push(m[1]);});return t.sort();}
var base=toks(rootBlk.body);
console.log('base :root token count: '+base.length);

// find the 20 palette blocks by their selector
var re=/html\[data-mode="[a-z]+"\](\s*\[data-theme="(light|dark)"\])?\s*\{/g,m,blocks=[];
while((m=re.exec(css))){
  var b=blockAt(m.index+m[0].length-1);
  blocks.push({ sel:m[0].replace(/\s*\{$/,'').trim(), tokens: toks(b.body), start:m.index });
}
console.log('palette blocks found: '+blocks.length);

var problems=0;
blocks.forEach(function(b){
  var missing=base.filter(t=>b.tokens.indexOf(t)<0);
  var extra=b.tokens.filter(t=>base.indexOf(t)<0);
  if(missing.length||extra.length){
    problems++;
    console.log('  '+b.sel);
    if(missing.length) console.log('     missing: '+missing.join(', '));
    if(extra.length) console.log('     extra  : '+extra.join(', '));
  }
});
console.log('blocks with a token-set mismatch: '+problems+' (expect 0)');
var counts=[...new Set(blocks.map(b=>b.tokens.length))];
console.log('distinct token counts across blocks: '+counts.join(', '));