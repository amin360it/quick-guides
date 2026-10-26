var fs = require('fs');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f) && NON.indexOf(f)<0; });

var checks = {
  'skip link to #content'   : /<a[^>]*class="[^"]*skip[^"]*"[^>]*href="#content"|class="am-skip"/,
  'main#content present'    : /<main id="content"/,
  'nav#toc has aria-label'  : /<nav id="toc"[^>]*aria-label=/,
  'modeBtn aria-expanded'   : /id="modeBtn"[^>]*aria-expanded/,
  'modePop role=dialog|list': /id="modePop"[^>]*role=/,
  'themeBtn aria-label'     : /id="themeBtn"[^>]*aria-label=/,
  'to-top aria-label'       : /id="toTop"[^>]*aria-label=/,
  'burger aria-label'       : /id="burger"[^>]*aria-label=/,
  'lang attribute'          : /<html lang="en"/,
  'viewport meta'           : /<meta name="viewport"/
};
var missing = {};
Object.keys(checks).forEach(function(k){ missing[k]=[]; });
guides.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  Object.keys(checks).forEach(function(k){
    if(!checks[k].test(c)) missing[k].push(f);
  });
});
console.log('=== accessibility / structure across '+guides.length+' guides ===');
Object.keys(checks).forEach(function(k){
  var n=missing[k].length;
  console.log('  '+(n===0?'OK  ':'MISS')+'  '+k.padEnd(26)+(n? n+' pages: '+missing[k].slice(0,5).join(', '):''));
});

// count aria attributes overall
var withAria=guides.filter(function(f){ return /aria-/.test(fs.readFileSync(f,'utf8')); }).length;
console.log('\nguides with any aria-* attribute: '+withAria+'/'+guides.length);

// focus-visible presence in CSS
var css=fs.readFileSync('assets/shell.css','utf8');
console.log('focus-visible rules in shell.css: '+(css.match(/:focus-visible/g)||[]).length);
console.log('prefers-reduced-motion blocks   : '+(css.match(/prefers-reduced-motion/g)||[]).length);