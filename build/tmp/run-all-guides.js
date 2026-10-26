var fs = require('fs');
var { execSync } = require('child_process');
var NON=['index.html','topics.html','search.html','favorites.html'];
var guides=fs.readdirSync('.').filter(f=>/\.html$/.test(f)&&NON.indexOf(f)<0).sort();
var fail=0, ok=0, details=[];
guides.forEach(function(g){
  try {
    var out=execSync('node agent_scripts/check-guide.js "'+g+'"',{encoding:'utf8',stdio:['ignore','pipe','pipe']});
    if(/\n\s+OK/.test(out)) ok++; else { fail++; details.push(g+': no OK marker'); }
  } catch(e) {
    fail++;
    var o=(e.stdout||'')+(e.stderr||'');
    var probs=(o.match(/PROBLEMS:[\s\S]*?(?=\n\s*$|$)/)||[''])[0].trim();
    details.push(g+' :: '+probs.split('\n').slice(1).map(s=>s.trim()).join(' ; '));
  }
});
console.log('OK: '+ok+'   FAIL: '+fail+'   (total '+guides.length+')');
console.log('');
details.forEach(d=>console.log('  '+d));