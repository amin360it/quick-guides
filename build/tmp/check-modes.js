var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8');
var js=fs.readFileSync('assets/shell.js','utf8');

// 1. every data-mode in CSS has a MODES entry in shell.js
var cssModes=[...new Set([...css.matchAll(/\[data-mode="([a-z]+)"\]/g)].map(m=>m[1]))].sort();
var jsBlock=js.match(/var MODES\s*=\s*\[([\s\S]*?)\];/);
var jsModes=jsBlock?[...new Set([...jsBlock[1].matchAll(/id:\s*'([a-z]+)'/g)].map(m=>m[1]))].sort():[];
console.log('CSS modes  ('+cssModes.length+'): '+cssModes.join(', '));
console.log('JS  modes  ('+jsModes.length+'): '+jsModes.join(', '));
var onlyCss=cssModes.filter(m=>jsModes.indexOf(m)<0);
var onlyJs=jsModes.filter(m=>cssModes.indexOf(m)<0);
console.log('in CSS not JS: '+(onlyCss.length?onlyCss.join(', '):'none'));
console.log('in JS not CSS: '+(onlyJs.length?onlyJs.join(', '):'none'));

// 2. palette block count: 10 modes x 2 themes = 20
var blocks=(css.match(/\[data-mode="[a-z]+"\](?:\s*,\s*(?:html\[[a-z-]+="[a-z]+"\]))?\s*\{/g)||[]).length;
console.log('\npalette blocks: '+blocks+' (expect 20)');

// 3. each palette block declares the same token set as the base
function toksOf(src){var t={};src.split(';').forEach(function(d){var m=d.match(/^\s*(--[a-z0-9-]+)\s*:/);if(m)t[m[1]]=1;});return Object.keys(t).sort();}
var base=(css.match(/^:root\s*\{([\s\S]*?)\}/m)||[,''])[1];
var baseToks=toksOf(base);
console.log('base :root declares '+baseToks.length+' tokens');
var pb=[...css.matchAll(/\[data-mode="[a-z]+"\][^{]*\{([\s\S]*?)\n\}/g)];
var mismatched=0;
pb.forEach(function(m){
  var t=toksOf(m[1]);
  var missing=baseToks.filter(x=>t.indexOf(x)<0);
  if(missing.length){ mismatched++; console.log('  block missing: '+missing.join(', ')); }
});
console.log('palette blocks missing a base token: '+mismatched);

// 4. no palette block redefines a radius (corner is not a colour)
var radiusInPalette=pb.filter(m=>/--radius/.test(m[1])).length;
console.log('palette blocks redefining a radius token: '+radiusInPalette+' (expect 0)');

// 5. GUIDES_CATALOG vs disk
var NON=['index.html','topics.html','search.html','favorites.html'];
var disk=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
var cat=js.match(/var GUIDES_CATALOG\s*=\s*\[([\s\S]*?)\n\];/);
var refs=[...new Set((cat[1].match(/'[a-z0-9.-]+\.html'/g)||[]).map(x=>x.replace(/'/g,'')))];
console.log('\ncatalog entries: '+refs.length+'  disk guides: '+disk.length);
var dangling=refs.filter(f=>!disk.includes(f));
var uncatalogued=disk.filter(f=>!refs.includes(f));
console.log('catalog -> missing file: '+(dangling.length?dangling.join(', '):'none'));
console.log('disk -> not in catalog  : '+(uncatalogued.length?uncatalogued.join(', '):'none'));