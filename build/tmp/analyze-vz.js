var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Find all codeWrap blocks and examine their content for raw < characters
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var m;
var i = 0;
var allRaw = [];

while ((m = codeRe.exec(vz))) {
  i++;
  var body = m[1];
  // Find all < characters that are not at the start of code block delimiters
  // Look for < that are followed by anything except whitespace or specific patterns
  // Also look for < at the beginning of lines within code
  var rawMatches = body.match(/<[^<>&]/g);
  if (rawMatches) {
    rawMatches.forEach(function(m) {
      allRaw.push('Block ' + i + ': ' + JSON.stringify(m));
    });
  }
}

// Show unique raw characters
var uniqueRaw = [...new Set(allRaw)];
console.log('Total raw < findings: ' + uniqueRaw.length);
uniqueRaw.slice(0, 30).forEach(function(r) { console.log(r); });
if (uniqueRaw.length > 30) {
  console.log('... and ' + (uniqueRaw.length - 30) + ' more');
}