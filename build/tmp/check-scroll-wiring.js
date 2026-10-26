var fs = require('fs');
var css=fs.readFileSync('assets/shell.css','utf8');
var js=fs.readFileSync('assets/shell.js','utf8');

// 1. mode control block must be LAST (it truncates to EOF)
var marker='mode-pop::-webkit-scrollbar';
var lastRules=css.slice(css.indexOf(marker)).trimEnd();
console.log('mode control block is at end of file: '+(lastRules.length<1200));

// 2. regions shell.js tells us to style must have scrollbar rules
var scrollRegions=['nav#toc','.topnav .tn-scroll','.am-side-nav','.am-drawer','.am-tlist','.codeWrap pre','.table-scroll','table','.mode-pop'];
console.log('\n=== scrollbar coverage ===');
scrollRegions.forEach(function(sel){
  var fw=/scrollbar-width:\s*thin/.test(RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^}]*}').test(css)?css:'');
  var ffx=new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'::-webkit-scrollbar[\\s\\S]{0,400}?\\}').test(css);
  var ffw2=new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^,{]*,\\s*[^{]*'+sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^,{]*::-webkit-scrollbar').test(css);
  console.log('  '+sel.padEnd(20)+' firefox='+(fw?'y':'n')+'  webkit='+(ffx||ffw2?'y':'n'));
});

// 3. every page links shell.css exactly once and shell.js once, and has both axes
var NON=['index.html','topics.html','search.html','favorites.html'];
var pages=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0);
var problems=[];
pages.forEach(function(f){
  var c=fs.readFileSync(f,'utf8');
  var cssLinks=(c.match(/<link[^>]*shell\.css/g)||[]).length;
  var jsLinks=(c.match(/<script[^>]*shell\.js/g)||[]).length;
  var axes=/<html[^>]*data-theme="dark"[^>]*data-mode="default"/.test(c);
  var modeBtn=/id="modeBtn"/.test(c);
  var themeBtn=/id="themeBtn"/.test(c);
  var modePop=/id="modePop"/.test(c);
  if(cssLinks!==1) problems.push(f+' shell.css links='+cssLinks);
  if(jsLinks!==1) problems.push(f+' shell.js links='+jsLinks);
  if(!axes) problems.push(f+' missing both axes on <html>');
  if(!modeBtn) problems.push(f+' missing #modeBtn');
  if(!themeBtn) problems.push(f+' missing #themeBtn');
  if(!modePop) problems.push(f+' missing #modePop');
});
console.log('\n=== shell wiring across '+pages.length+' guides ===');
console.log(problems.length? problems.map(p=>'  '+p).join('\n') : '  all pages: 1 css link, 1 js link, both axes, all three controls');