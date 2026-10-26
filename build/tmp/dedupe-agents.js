var fs = require('fs');
var p='AGENTS.md';
var lines=fs.readFileSync(p,'utf8').split('\n');

// The new table ends at the first "| `wp-theme.html` | WordPress Theme
// Development |" row. Everything from the blank line after it up to (but not
// including) the next heading is the leftover old table.
var lastNew=-1;
for(var i=0;i<lines.length;i++){
  if(/^\| `wp-theme\.html` \| WordPress Theme Development \|/.test(lines[i])) lastNew=i;
}
if(lastNew<0){ console.error('end of new table not found'); process.exit(1); }
console.log('new table ends at line '+(lastNew+1));

// find the next markdown heading after that
var nextHeading=-1;
for(var j=lastNew+1;j<lines.length;j++){
  if(/^#{1,3} /.test(lines[j])){ nextHeading=j; break; }
}
if(nextHeading<0){ console.error('no following heading'); process.exit(1); }
console.log('next heading at line '+(nextHeading+1)+': '+lines[nextHeading].slice(0,60));

var removed=nextHeading-(lastNew+1);
console.log('removing '+removed+' leftover lines');
console.log('  first removed: '+JSON.stringify(lines[lastNew+1]));
console.log('  last  removed: '+JSON.stringify(lines[nextHeading-1]));

var out=lines.slice(0,lastNew+1).concat(lines.slice(nextHeading));
fs.writeFileSync(p,out.join('\n'),'utf8');
console.log('done');