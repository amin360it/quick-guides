var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8');
var stripped=css.replace(/\/\*[\s\S]*?\*\//g,'');
// palette blocks are html[data-mode="..."] or [data-theme="dark"] etc
var paletteRegions=stripped.match(/\[data-mode="[a-z]+"\][^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g)||[];
console.log('palette blocks found: '+paletteRegions.length);
var inPalette=paletteRegions.join('').match(/#[0-9a-fA-F]{3,8}\b/g)||[];
console.log('hex inside palette blocks: '+inPalette.length);
// now hex OUTSIDE palette blocks
var rest=stripped;
paletteRegions.forEach(function(p){ rest=rest.replace(p,''); });
var hexRest=[...rest.matchAll(/\{([^{}]*)\}/g)].flatMap(m=>m[1].match(/#[0-9a-fA-F]{3,8}\b/g)||[]);
console.log('hex in NON-palette rule bodies: '+hexRest.length);
var uniq=[...new Set(hexRest)];
uniq.slice(0,20).forEach(h=>console.log('   '+h));