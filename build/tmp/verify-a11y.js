var fs = require('fs');
var pages = fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); });
var probs = [];
pages.forEach(function(f){
  var c = fs.readFileSync(f,'utf8');
  var nSkip = (c.match(/class="am-skip"/g)||[]).length;
  var nMain = (c.match(/<main id="content"/g)||[]).length;
  var bodyAt = c.indexOf('<body');
  var skipAt = c.indexOf('<a class="am-skip"');
  // first focusable must be the skip link
  var between = c.slice(bodyAt, skipAt);
  var firstFocusable = /<(a|button|input|select|textarea)\b/.test(between);
  if (nSkip !== 1) probs.push(f+' am-skip='+nSkip);
  if (nMain !== 1) probs.push(f+' main#content='+nMain);
  if (skipAt < 0) probs.push(f+' no skip link');
  if (firstFocusable) probs.push(f+' something focusable precedes the skip link');
  if (c.indexOf('id="themeBtn"')>=0 && !/id="themeBtn"[^>]*aria-label=/.test(c)) probs.push(f+' themeBtn has no aria-label');
  if ((c.match(/<main\b/g)||[]).length !== 1) probs.push(f+' main count != 1');
});
console.log('pages: '+pages.length);
console.log('problems: '+probs.length);
[...new Set(probs)].forEach(function(p){ console.log('  '+p); });

// CSS sanity after the edit
var css=fs.readFileSync('assets/shell.css','utf8');
var stripped=css.replace(/\/\*[\s\S]*?\*\//g,'');
console.log('\nshell.css braces: { ='+(stripped.match(/{/g)||[]).length+'  } ='+(stripped.match(/}/g)||[]).length);
console.log('comments with a brace: '+(css.match(/\/\*[\s\S]*?\*\//g)||[]).filter(function(c){return /[{}]/.test(c);}).length);
console.log('.am-skip rules: '+(css.match(/\.am-skip/g)||[]).length);
console.log('border-radius off-scale: '+(stripped.match(/border-radius:\s*([^;}]+)/g)||[]).filter(function(r){
  var v=r.replace(/border-radius:\s*/,'').trim();
  return ['var(--radius)','var(--radius-xs)','var(--radius-lg)','50%','999px','99px','0'].indexOf(v)<0;
}).length);