var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Find all codeWrap blocks and escape raw < inside code content
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var blocksChanged = 0;
var result = vz.replace(codeRe, function(match, body) {
  // Escape raw < characters that are not part of HTML entities
  // Replace < that are followed by a-z (HTML tags) with <
  var escapedBody = body.replace(/<([a-zA-Z])/g, '<$1');
  if (escapedBody !== body) blocksChanged++;
  return '<div class="codeWrap"><pre><code>' + escapedBody + '</code></pre></div>';
});

if (blocksChanged > 0) {
  fs.writeFileSync(path, result, 'utf8');
  console.log('Fixed ' + blocksChanged + ' blocks in virtualization.main.html');
} else {
  console.log('No blocks needed fixing in virtualization.main.html');
}