var fs = require('fs');

// 1. CSS brace balance, skipping comments (AGENTS.md: a brace in a comment
//    makes every verifier report the sheet unbalanced)
var css=fs.readFileSync('assets/shell.css','utf8');
var stripped=css.replace(/\/\*[\s\S]*?\*\//g,'');
console.log('shell.css braces: { ='+(stripped.match(/{/g)||[]).length+'  } ='+(stripped.match(/}/g)||[]).length);

// 2. no literal braces inside CSS comments (the documented trap)
var comments=css.match(/\/\*[\s\S]*?\*\//g)||[];
var braceInComment=comments.filter(c=>/[{}]/.test(c));
console.log('CSS comments containing { or }: '+braceInComment.length);
braceInComment.slice(0,3).forEach(c=>console.log('   '+c.slice(0,120).replace(/\n/g,' ')));

// 3. border-radius must use the three tokens (or a deliberate circle)
var radii=[...css.matchAll(/border-radius:\s*([^;}]+)/g)].map(m=>m[1].trim());
var allowed=['var(--radius)','var(--radius-xs)','var(--radius-lg)','50%','999px','99px','0'];
var badR=radii.filter(r=>!allowed.includes(r));
console.log('\nborder-radius declarations: '+radii.length+'  off-scale: '+badR.length);
[...new Set(badR)].forEach(r=>console.log('   '+r));

// 4. no hard-coded colours outside the palette/token definitions
var hexInRules=[...stripped.matchAll(/\{([^{}]*)\}/g)].flatMap(m=>m[1].match(/#[0-9a-fA-F]{3,8}\b/g)||[]);
console.log('\nhex colours inside rule bodies: '+hexInRules.length+' (should be ~0; tokens are defined at :root)');

// 5. the ch-toc node/spine geometry (the CSS question from earlier)
var spine=css.match(/\.ch-toc-list::before\{([\s\S]*?)\}/);
var node=css.match(/\.ch-toc-list a::before\{([\s\S]*?)\}/);
console.log('\nspine rule: '+JSON.stringify(spine?spine[1].replace(/\s+/g,' ').trim():'?'));
console.log('node  rule: '+JSON.stringify(node?node[1].replace(/\s+/g,' ').trim():'?'));