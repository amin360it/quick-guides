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
  console.log('Block 71 content length:', block71.length);
  console.log('Block 71 first 500 chars:', JSON.stringify(block71.substring(0, 500)));
  console.log('---');
  // Find all < characters and their context
  var matches = block71.match(/<[^<>&]/g);
  console.log('Raw < matches count:', matches ? matches.length : 0);
  if (matches) {
    console.log('Raw < matches:', matches.slice(0, 50));
  }
} else {
  console.log('Block 71 not found');
}