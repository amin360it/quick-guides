var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Find all codeWrap blocks and count raw < characters inside code content
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var m;
var i = 0;
var totalRaw = 0;
var rawDetails = [];

while ((m = codeRe.exec(vz))) {
  i++;
  var body = m[1];
  // Count all < characters that are not part of </ or <code> or <div etc
  // Simple count of < that are followed by something
  var rawCount = (body.match(/<[^<>&]/g) || []).length;
  totalRaw += rawCount;
  if (rawCount > 0) {
    rawDetails.push('Block ' + i + ': ' + rawCount + ' raw <');
  }
}

console.log('Total raw < count: ' + totalRaw);
rawDetails.forEach(function(d) { console.log(d); });
console.log('Total code blocks: ' + i);