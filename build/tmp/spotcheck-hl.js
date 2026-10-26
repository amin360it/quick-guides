var fs = require('fs');
var cp = require('child_process');

var EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
var TMP = 'C:\\Users\\user\\AppData\\Local\\Temp\\opencode';

function dump(page, tag) {
  var cmd = '"' + EDGE + '" --headless=new --disable-gpu --no-sandbox ' +
            '--user-data-dir="' + TMP + '\\edgeprof-' + tag + '" --virtual-time-budget=5000 ' +
            '--dump-dom "http://localhost:8080/' + page + '"';
  var dom = cp.execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, shell: 'cmd.exe', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.writeFileSync('build/tmp/spot-' + tag + '.html', dom, 'utf8');
  return dom;
}

function firstBlocks(dom, count) {
  var out = [];
  var re = /<code data-hl="1">([\s\S]*?)<\/code>/g, m, n = 0;
  while ((m = re.exec(dom)) && n < count) { out.push(m[1]); n++; }
  return out;
}

// ---- CSS: --custom-property must NOT be a comment -------------------------
var css = dump('css.html', 'css');
var cssBlocks = firstBlocks(css, 6);
var commentOnCustomProp = cssBlocks.filter(function (b) {
  return /<span class="c">[^<]*--[a-z]/i.test(b);
});
console.log('=== css.html ===');
console.log('  blocks with a --custom-property styled as a comment: ' + commentOnCustomProp.length);
if (commentOnCustomProp.length) console.log('  sample: ' + JSON.stringify(commentOnCustomProp[0].slice(0, 260)));
var cssHasAnyComment = cssBlocks.some(function (b) { return /<span class="c">/.test(b); });
console.log('  at least one real /* */ comment styled: ' + cssHasAnyComment);

// ---- Python: # comments should be styled ---------------------------------
var py = dump('python.html', 'py');
var pyBlocks = firstBlocks(py, 12);
var pyWithHash = pyBlocks.filter(function (b) { return (b.match(/<span class="c">/g) || []).length; });
console.log('\n=== python.html ===');
console.log('  of 12 blocks, those with a styled # comment: ' + pyWithHash.length);
if (pyWithHash.length) console.log('  sample: ' + JSON.stringify(pyWithHash[0].slice(0, 300)));

// ---- SQL: -- comments ----------------------------------------------------
var sql = dump('sqlserver.html', 'sql');
var sqlBlocks = firstBlocks(sql, 12);
var sqlWithDash = sqlBlocks.filter(function (b) { return /<span class="c">/.test(b); });
console.log('\n=== sqlserver.html ===');
console.log('  of 12 blocks, those with a styled -- comment: ' + sqlWithDash.length);
if (sqlWithDash.length) console.log('  sample: ' + JSON.stringify(sqlWithDash[0].slice(0, 300)));

// ---- HTML guide: a tag sample should colour keywords, not leak entities ---
var html = dump('laravel-blade.html', 'blade');
var bl = firstBlocks(html, 4);
console.log('\n=== laravel-blade.html ===');
console.log('  first block: ' + JSON.stringify(bl[0] ? bl[0].slice(0, 300) : 'none'));
