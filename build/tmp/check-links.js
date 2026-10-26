var fs = require('fs');
var path=require('path');
var pages=fs.readdirSync('.').filter(f=>/\.html$/.test(f));

// Strip code before harvesting links: a sample is showing ITS OWN project's
// file paths, which are not links in this library.
//
// Three separate regions have to go, and each one shipped a false positive
// before it was added:
//   1. fenced samples      - <div class="codeWrap"><pre><code> ... closer
//   2. inline <code> spans - `<img src="a.png">` is a tag shown as TEXT; it
//                            reported 6 phantom broken files (a.png, logo.svg,
//                            /app/, file.js, VALUE, file.svg#id)
//   3. inline <script>     - search.html builds `href="' + url + '"` by string
//                            concatenation, which read as a missing file
//                            called "' + url + '"
// A checker that reports a missing file for a string literal is not checking
// links, so these are stripped rather than special-cased by filename.
function stripCode(s){
  return s
    .replace(/<div class="codeWrap">[\s\S]*?<\/code><\/pre><\/div>/g,'')
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/g,'')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
}
var anchorsOf={};
pages.forEach(function(f){
  var set=new Set();
  (fs.readFileSync(f,'utf8').match(/id="([^"]+)"/g)||[]).forEach(m=>set.add(m.slice(4,-1)));
  anchorsOf[f]=set;
});
var bad=[],checked=0;
pages.forEach(function(f){
  var c=stripCode(fs.readFileSync(f,'utf8'));
  var re=/(?:href|src)="([^"]+)"/g,m;
  while((m=re.exec(c))){
    var href=m[1];
    if(/^(https?:|mailto:|data:|javascript:|#|\{|\$|~|\.\.\/)/.test(href)) continue;
    if(/\{\{|\$\{|\$\(/.test(href)) continue;              // template literal
    checked++;
    var clean=href.split('#')[0].split('?')[0];
    if(!clean) continue;
    var target=path.basename(clean);
    if(!fs.existsSync(clean)){ bad.push(f+' -> '+href+'  (FILE MISSING)'); continue; }
    var hash=href.indexOf('#')!==-1?href.split('#')[1]:null;
    if(hash && target.endsWith('.html') && anchorsOf[target] && !anchorsOf[target].has(hash)){
      bad.push(f+' -> '+href+'  (ANCHOR MISSING)');
    }
  }
});
console.log('real links checked: '+checked);
var uniq=[...new Set(bad)];
console.log('broken: '+uniq.length);
uniq.slice(0,50).forEach(b=>console.log('  '+b));
if(uniq.length>50) console.log('  ... +'+(uniq.length-50)+' more');