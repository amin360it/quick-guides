const fs = require('fs');
let c = fs.readFileSync('package-publishing.html', 'utf-8');
// Check ch10-monorepo h4s with correct prefix
let h4c = (c.match(/<h4 id="ch10-mono-/g) || []);
console.log('ch10-monorepo h4 count (correct prefix):', h4c.length);
// Check specific ids
['ch10-mono-changelogs', 'ch10-mono-version-prop', 'ch10-mono-changesets'].forEach(id => {
    let ic = (c.match(new RegExp('<h4 id="' + id + '"', 'g')) || []).length;
    console.log('  ' + id + ': ' + ic + ' occurrence(s)');
});
// Also check codeWraps
let cw = (c.match(/<div class="codeWrap">/g) || []).length;
console.log('ch10-monorepo codeWrap count:', cw);