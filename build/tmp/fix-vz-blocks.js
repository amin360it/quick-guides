var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Find all codeWrap blocks
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var m;
var i = 0;
var blocks = [];

while ((m = codeRe.exec(vz))) {
  i++;
  var body = m[1];
  // Count < characters in code content
  var ltCount = (body.match(/</g) || []).length;
  var gtCount = (body.match(/>/g) || []).length;
  blocks.push({ i: i, body: body, lt: ltCount, gt: gtCount });
}

// Find block 71 specifically
var b71 = blocks.find(function(b) { return b.i === 71; });
if (b71) {
  console.log('Block 71:');
  console.log('  Total <: ' + b71.lt);
  console.log('  Total >: ' + b71.gt);
  console.log('  Body length: ' + b71.body.length);
  // Show first 200 chars
  console.log('  First 200: ' + JSON.stringify(b71.body.substring(0, 200)));
  // Show last 200 chars
  console.log('  Last 200: ' + JSON.stringify(b71.body.substring(b71.body.length - 200)));
  
  // Find all < positions
  var positions = [];
  var pos = 0;
  while ((pos = b71.body.indexOf('<', pos)) !== -1) {
    positions.push(pos);
    pos++;
  }
  console.log('  < positions: ' + positions.length);
  console.log('  First 20 positions: ' + JSON.stringify(positions.slice(0, 20)));
  for (var p = 0; p < Math.min(positions.length, 20); p++) {
    var start = Math.max(0, positions[p] - 20);
    var end = Math.min(b71.body.length, positions[p] + 20);
    console.log('  pos ' + positions[p] + ': ...' + JSON.stringify(b71.body.substring(start, end)) + '...');
  }
}

// Now escape all < to < in all code blocks, but only the ones that need it
var changed = 0;
var newVz = vz.replace(codeRe, function(match, body) {
  var newBody = body.replace(/</g, '<');
  if (newBody !== body) changed++;
  return '<div class="codeWrap"><pre><code>' + newBody + '</code></pre></div>';
});

if (changed > 0) {
  fs.writeFileSync(path, newVz, 'utf8');
  console.log('Escaped < in ' + changed + ' code blocks');
} else {
  console.log('No < characters needed escaping');
}

// Re-validate
var { execSync } = require('child_process');
try {
  execSync('node agent_scripts/validate-fragment.js build/newguides/virtualization.main.html', { stdio: 'inherit' });
  console.log('Validation PASSED');
} catch(e) {
  console.log('Validation result:');
  console.log(e.stdout.toString());
}