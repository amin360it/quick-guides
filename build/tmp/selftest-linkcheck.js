var fs = require('fs');
var cp = require('child_process');

// Prove check-links.js still FAILS on a genuine defect after the stripping
// change. Two probes: a missing file and a missing anchor. The probe page is
// created in the repo root (that is where the checker looks) and removed in a
// finally block, because a stray .html there would become part of the shipped
// library and be picked up by every other checker.

var PROBE = 'zz-probe-linkcheck.html';
var body = [
  '<!DOCTYPE html><html><head><title>probe</title></head><body>',
  '<a href="this-file-does-not-exist.html">missing file</a>',
  '<a href="index.html#no-such-anchor-xyz">missing anchor</a>',
  '<code>&lt;img src="inside-code.png"&gt;</code>',
  '</body></html>'
].join('\n');

var results = [];
try {
  fs.writeFileSync(PROBE, body, 'utf8');
  var out = cp.execSync('node build/tmp/check-links.js', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  var broken = parseInt((out.match(/broken:\s*(\d+)/) || [])[1], 10);
  results.push(['missing file detected', /this-file-does-not-exist\.html/.test(out)]);
  results.push(['missing anchor detected', /no-such-anchor-xyz/.test(out)]);
  results.push(['inline <code> NOT reported', !/inside-code\.png/.test(out)]);
  results.push(['broken count > 0', broken > 0]);
  console.log('probe run: broken=' + broken);
  console.log(out.split('\n').filter(function (l) { return /zz-probe|broken:/.test(l); }).join('\n'));
} finally {
  if (fs.existsSync(PROBE)) fs.unlinkSync(PROBE);
  console.log('\nprobe removed: ' + !fs.existsSync(PROBE));
}

console.log('\n=== self-test ===');
var ok = true;
results.forEach(function (r) {
  console.log('  ' + (r[1] ? 'PASS' : 'FAIL') + '  ' + r[0]);
  if (!r[1]) ok = false;
});
console.log(ok ? '\ncheck-links.js is a real check.' : '\n*** CHECK IS BLIND ***');
process.exit(ok ? 0 : 1);
