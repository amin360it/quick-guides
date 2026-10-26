const fs = require('fs');
let path = 'package-publishing.html';
let content = fs.readFileSync(path, 'utf-8');

// Fix ch9-devpi duplication: the h3 marker appeared twice, causing the h4/prose/codeWrap
// to be inserted in two places. I need to remove the duplicate while keeping the first occurrence.

// Strategy: find the SECOND occurrence of '<h3 id="ch9-devpi" data-toc>devpi, for PyPI</h3>'
// and remove everything from there to the end of the second codeWrap block,
// then keep only the first occurrence.

// Find first occurrence of h3
let firstH3 = content.indexOf('<h3 id="ch9-devpi" data-toc>devpi, for PyPI</h3>');
if (firstH3 < 0) {
    console.log('First h3 not found');
    process.exit(1);
}

// Find second occurrence of h3 (should be after the first)
let secondH3 = content.indexOf('<h3 id="ch9-devpi" data-toc>devpi, for PyPI</h3>', firstH3 + 1);
if (secondH3 < 0) {
    console.log('No second h3 found - duplication may not exist, or structure is different');
    // Just check h4 count
    let h4Count = (content.match(/<h4 id="ch9-devpi-index">/g) || []).length;
    console.log('ch9-devpi h4 count: ' + h4Count);
    process.exit(0);
}

console.log('First h3 at position: ' + firstH3);
console.log('Second h3 at position: ' + secondH3);

// Find the end of the first codeWrap block after the first h3
let afterFirstH3 = content.substring(firstH3);
let firstCodeWrapClose = afterFirstH3.indexOf('</code></pre></div>');
if (firstCodeWrapClose < 0) {
    console.log('First codeWrap close not found');
    process.exit(1);
}

// Find the second codeWrap close after the first h3
let afterFirstCodeWrap = afterFirstH3.substring(firstCodeWrapClose + '</code></pre></div>'.length);
let secondCodeWrapClose = afterFirstCodeWrap.indexOf('</code></pre></div>');
if (secondCodeWrapClose < 0) {
    console.log('Second codeWrap close not found');
    process.exit(1);
}

// The duplicate section starts at the second h3 and ends at the second codeWrap close
let dupStart = firstH3 + firstCodeWrapClose + '</code></pre></div>'.length;
let dupEnd = firstH3 + firstCodeWrapClose + '</code></pre></div>'.length + secondCodeWrapClose;

// Actually, let me reconsider. The second h3 is the cause of the duplication.
// I need to remove the section from the second h3 to the end of the second codeWrap.

// Let me find what's between the first codeWrap close and the second codeWrap close
let sectionBetween = content.substring(firstH3 + firstCodeWrapClose + '</code></pre></div>'.length, 
    firstH3 + firstCodeWrapClose + '</code></pre></div>'.length + secondCodeWrapClose);

console.log('Section between first codeWrap close and second codeWrap close length: ' + sectionBetween.length);

// Let me just remove the duplicate by keeping everything up to the first codeWrap close,
// and then everything from after the second codeWrap close to the end.

// Actually, a simpler approach: remove the second occurrence of the h3 and everything 
// that was added as a result of the double replacement.

// The key insight: the file now has TWO complete ch9-devpi sections.
// I need to keep the FIRST one and remove the SECOND one.

// Find the position after the first codeWrap close
let afterFirstSection = firstH3 + firstCodeWrapClose + '</code></pre></div>'.length;

// Find where the second h3 section starts and ends
// The second h3 is at position secondH3
// The second codeWrap close is at position secondH3 + some offset

// Let me just find the end of the second codeWrap block
let afterSecondH3 = content.substring(secondH3);
let endOfSecondCodeWrap = afterSecondH3.indexOf('</code></pre></div>');
if (endOfSecondCodeWrap < 0) {
    console.log('End of second codeWrap not found');
    process.exit(1);
}

// The content to keep: everything before the second h3, plus everything after the second codeWrap close
let newContent = content.substring(0, secondH3) + content.substring(secondH3 + endOfSecondCodeWrap + '</code></pre></div>'.length);

let before = content.length;
let after = newContent.length;
console.log('Removing ' + (before - after) + ' characters');

if (newContent !== content) {
    fs.writeFileSync(path, newContent, 'utf-8');
    console.log('File rewritten successfully');
} else {
    console.log('No change made');
}

// Verify the result
let check = fs.readFileSync(path, 'utf-8');
let devpiH3Count = (check.match(/<h3 id="ch9-devpi"/g) || []).length;
let devpiH4Count = (check.match(/<h4 id="ch9-devpi-index">/g) || []).length;
console.log('ch9-devpi h3 count: ' + devpiH3Count);
console.log('ch9-devpi h4 count: ' + devpiH4Count);

// Also check the ch9-artifactory, ch9-github, ch9-auth, ch9-proxy, ch9-migrate h4 counts
['ch9-artifactory', 'ch9-github', 'ch9-auth', 'ch9-proxy', 'ch9-migrate'].forEach(prefix => {
    let h4Count = (check.match(new RegExp('<h4 id="' + prefix + '-', 'g')) || []).length;
    console.log(prefix + ' h4 count: ' + h4Count);
});