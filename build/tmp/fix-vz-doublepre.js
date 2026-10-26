var fs = require('fs');
var path = 'build/newguides/virtualization.main.html';
var vz = fs.readFileSync(path, 'utf8');

// Fix: replace double </pre> with single </pre> in code blocks
// The issue: some code blocks have </code></pre></pre></div> instead of </code></pre></div>
// This causes 37 raw < characters in the validator

// First, let's check if there are code blocks with double </pre>
var codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
var m;
var i = 0;
var doublePreBlocks = [];

// Check for double </pre> pattern: </code></pre></pre></div>
// This pattern has two </pre> tags in a row
var doublePreTagRe = /<\/code><\/pre><\/pre><\/div>/;

console.log('Checking for double </pre> tags...');

// Find all code blocks and check for double </pre>
var allBlocks = vz.match(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g);
if (allBlocks) {
  allBlocks.forEach(function(block, idx) {
    if (doublePreTagRe.test(block)) {
      doublePreBlocks.push({ idx: idx, block: block });
    }
  });
}

console.log('Blocks with double </pre>: ' + doublePreBlocks.length);
doublePreBlocks.forEach(function(b) {
  console.log('Block ' + b.idx + ': has double </pre>');
});

// Now fix: replace double </pre> with single </pre> in the full file
// We need to be careful to only fix the right occurrence
var fixedVz = vz.replace(doublePreTagRe, '</code></pre></div>');

if (fixedVz !== vz) {
  fs.writeFileSync(path, fixedVz, 'utf8');
  console.log('Fixed double </pre> in virtualization.main.html');
} else {
  console.log('No double </pre> pattern found with the simple regex');
  // Try a more targeted approach - find and fix block 71 specifically
}

// Validate
var { execSync } = require('child_process');
try {
  var result = execSync('node agent_scripts/validate-fragment.js build/newguides/virtualization.main.html', { stdio: 'pipe' });
  console.log('Validation output:');
  console.log(result.stdout.toString());
  console.log('Validation exit code: ' + result.status);
} catch(e) {
  console.log('Validation error:');
  console.log(e.stdout ? e.stdout.toString() : e.message);
}