var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Find code block 71
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var m;
var i = 0;
var block71;

while ((m = codeRe.exec(vz))) {
  i++;
  if (i === 71) {
    block71 = m[1];
    break;
  }
}

if (block71) {
  console.log('Block 71 full content:');
  console.log(block71);
  console.log('---');
  // Count < characters
  var ltCount = (block71.match(/</g) || []).length;
  console.log('Total < characters: ' + ltCount);
  // Count </ characters
  var ltSlashCount = (block71.match(/<\/g) || []).length;
  console.log('Total </ characters: ' + ltSlashCount);
  // Show positions of all < characters
  var positions = [];
  var pos = 0;
  while ((pos = block71.indexOf('<', pos)) !== -1) {
    positions.push(pos);
    pos++;
  }
  console.log('Positions of <: ' + JSON.stringify(positions.slice(0, 30)));
  console.log('Total < positions: ' + positions.length);
} else {
  console.log('Block 71 not found');
}