var fs = require('fs');
var p='AGENTS.md';
var c=fs.readFileSync(p,'utf8');

// collapse any run of markers into exactly one, and remove the stray backtick
// that the earlier passes left between them
c = c.replace(/\*\(absent\)\*(?:\s*`)?(?:\s*\*\(absent\)\*)+/g, '*(absent)*');
c = c.replace(/\*\(absent\)\*\s*`\s*\*\(absent\)\*/g, '*(absent)*');
c = c.replace(/`\s*\*\(absent\)\*/g, '*(absent)*');

fs.writeFileSync(p, c, 'utf8');

var lines=c.split('\n');
var bad=lines.filter(function(l){ return (l.match(/\*\(absent\)\*/g)||[]).length>1 || /`\s*\*\(absent\)\*/.test(l); });
console.log('rows still malformed: '+bad.length);
bad.forEach(function(l){ console.log('  '+l.slice(0,120)); });
console.log('');
console.log('rows now marked:');
lines.filter(function(l){ return /\*\(absent\)\*/.test(l); }).forEach(function(l){ console.log('  '+l.slice(0,100)); });