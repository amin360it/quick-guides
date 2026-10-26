var fs = require('fs');
function lum(hex){
  var h=hex.replace('#','');
  if(h.length===3) h=h.split('').map(c=>c+c).join('');
  var r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;
  var f=v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
}
function cr(a,b){var l1=lum(a),l2=lum(b);var hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+0.05)/(lo+0.05);}

var css=fs.readFileSync('assets/shell.css','utf8');
function tokens(sel){
  var re=new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*\\{([\\s\\S]*?)\\}');
  var m=css.match(re); if(!m) return null;
  var t={};
  m[1].split(';').forEach(function(d){
    var mm=d.match(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*$/);
    if(mm) t[mm[1]]=mm[2];
  });
  return t;
}
var root=tokens(':root');
var dark=tokens('html[data-theme="dark"]');
console.log('light tokens:',Object.keys(root).length,' dark tokens:',Object.keys(dark).length);

function check(name,t){
  var pairs=[['--brand','--brand-ink'],['--accent','--bg'],['--text','--bg'],['--muted','--bg'],['--brand-ink','--brand']];
  console.log('\n== '+name+' ==');
  pairs.forEach(function(p){
    var a=t[p[0]],b=t[p[1]];
    if(!a||!b){ console.log('  '+p[0]+' / '+p[1]+': MISSING'); return; }
    var r=cr(a,b);
    console.log('  '+p[0]+' on '+p[1]+': '+a+' / '+b+' = '+r.toFixed(2)+':1'+(r>=4.5?'  OK(AA text)':(r>=3?'  large/UI only':'  FAIL')));
  });
  // scrollbar thumb vs track
  if(t['--scroll-thumb']&&t['--scroll-track']){
    var r=cr(t['--scroll-thumb'],t['--scroll-track']);
    console.log('  scroll-thumb on track: '+r.toFixed(2)+':1'+(r>=3?'  OK(WCAG 1.4.11)':'  FAIL'));
  }
}
check('LIGHT',root);
check('DARK',dark);