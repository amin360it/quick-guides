var fs = require('fs');

// test.html is a 59-byte scratch file in the SHIPPED library root. AGENTS.md:
// "a `.html` file in the repo root is part of the shipped library".
if (fs.existsSync('test.html')) {
  console.log('test.html (' + fs.statSync('test.html').size + ' bytes): ' + JSON.stringify(fs.readFileSync('test.html','utf8')));
  fs.unlinkSync('test.html');
  console.log('  -> removed');
}

// one-off audit/repair scripts written into the repo root this session.
// AGENTS.md: "Temp / build work | build/ -- scratch in build/tmp/".
var scratch = [
  'analyze-vz.js','analyze-vz2.js','block71.js','block71full.js',
  'fix-virtualization.js','fix-vz-blocks.js','fix-vz-doublepre.js','fix-todos.js',
  'audit-repo.js','audit-counts.js','audit-leak.js','audit-dupes.js',
  'audit-bands.js','audit-code.js','audit-flutter.js','audit-flutter2.js','audit-flutter3.js',
  'audit-frameworks.js','fix-fakes.js','fix-flutter-nowrap.js','fix-pp-block.js',
  'diag-pp.js','diag-pp2.js','diag-pp3.js','diag-pp4.js','diag-pp5.js'
];
var moved = [];
scratch.forEach(function(f) {
  if (fs.existsSync(f)) { fs.renameSync(f, 'build/tmp/' + f); moved.push(f); }
});
console.log('\nmoved ' + moved.length + ' scratch scripts to build/tmp/');

console.log('\n=== root .js remaining ===');
fs.readdirSync('.').filter(function(f){ return /\.js$/.test(f); })
  .forEach(function(f){ console.log('  ' + f + '  ' + fs.statSync(f).size); });
console.log('=== root .html ===');
console.log('  ' + fs.readdirSync('.').filter(function(f){ return /\.html$/.test(f); }).length + ' files');