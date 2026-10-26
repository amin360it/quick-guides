const fs = require('fs');
let path = 'package-publishing.html';
let content = fs.readFileSync(path, 'utf-8');

// Fix ch10-monorepo duplication: remove the duplicate h4/prose/codeWrap
// that was introduced because the h3 marker appeared twice in the file.

// Find the first h3
let h3marker = '<h3 id="ch10-monorepo" data-toc>Publishing from a monorepo</h3>';
let firstH3 = content.indexOf(h3marker);
if (firstH3 < 0) {
    console.log('h3 marker not found');
    process.exit(1);
}

// Find the first codeWrap close after the h3
let afterFirstH3 = content.substring(firstH3);
let firstCodeWrapClose = afterFirstH3.indexOf('</code></pre></div>');
if (firstCodeWrapClose < 0) {
    console.log('first codeWrap close not found');
    process.exit(1);
}

// Now find the duplicate h4 that appears after the first codeWrap close
// The duplicate starts with <h4 id="ch10-mono-changelogs">
let afterFirstCodeWrap = afterFirstH3.substring(firstCodeWrapClose + '</code></pre></div>'.length);
let duplicateH4Start = afterFirstCodeWrap.indexOf('<h4 id="ch10-mono-changelogs">');
if (duplicateH4Start < 0) {
    console.log('duplicate h4 not found - may not exist or structure is different');
    // Check h4 count
    let h4regex = /<h4 id="ch10-mono-/g;
    let h4matches = content.match(h4regex);
    console.log('ch10-mono- h4 count:', h4matches ? h4matches.length : 0);
    process.exit(0);
}

console.log('duplicate h4 starts at position: ' + (firstH3 + firstCodeWrapClose + '</code></pre></div>'.length + duplicateH4Start));

// Find the end of the duplicate section (next codeWrap close after the duplicate h4)
let afterDuplicateH4 = afterFirstCodeWrap.substring(duplicateH4Start);
let nextCodeWrapClose = afterDuplicateH4.indexOf('</code></pre></div>');
if (nextCodeWrapClose < 0) {
    console.log('next codeWrap close not found');
    process.exit(1);
}

// Calculate positions in the full content string
let contentDupStart = firstH3 + firstCodeWrapClose + '</code></pre></div>'.length + duplicateH4Start;
let contentDupEnd = contentDupStart + nextCodeWrapClose + '</code></pre></div>'.length;

console.log('Removing duplicate section from ' + contentDupStart + ' to ' + contentDupEnd + ' (' + (contentDupEnd - contentDupStart) + ' chars)');

let newContent = content.substring(0, contentDupStart) + content.substring(contentDupEnd);
let before = content.length;
let after = newContent.length;
console.log('Removing ' + (before - after) + ' characters');

if (newContent !== content) {
    fs.writeFileSync(path, newContent, 'utf-8');
    console.log('ch10-monorepo duplication fixed');
} else {
    console.log('No change made');
}

// Verify
let check = fs.readFileSync(path, 'utf-8');
let h4regex = /<h4 id="ch10-mono-/g;
let h4matches = check.match(h4regex);
console.log('ch10-mono- h4 count after fix:', h4matches ? h4matches.length : 0);
// Also check for the specific h4 ids
['ch10-mono-changelogs', 'ch10-mono-version-prop', 'ch10-mono-changesets'].forEach(id => {
    let ic = (check.match(new RegExp('<h4 id="' + id + '"', 'g')) || []).length;
    console.log('  ' + id + ': ' + ic + ' occurrence(s)');
});