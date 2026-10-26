const fs = require('fs');
let path = 'package-publishing.html';
let content = fs.readFileSync(path, 'utf-8');

let marker = '<h3 id="ch10-monorepo" data-toc>Publishing from a monorepo</h3>';
let replacement = '<h3 id="ch10-monorepo" data-toc>Publishing from a monorepo</h3>' +
  '<h4 id="ch10-mono-changelogs">Per-package changelogs</h4>' +
  '<p>A monorepo changelog is useless. Generate per-package changelogs from the changesets, and keep a root CHANGELOG that only records changes to the public workspace API.</p>' +
  '<h4 id="ch10-mono-version-prop">Version propagation rules</h4>' +
  '<p>If @yourorg/plugin requires @yourorg/core ^1.2.0 and core goes to 2.0.0, the plugin must be released too, and its new version must widen its range. Write the rule down because exception cases accumulate.</p>' +
  '<div class="codeWrap"><pre><code>// WHAT A CORRECT TOOL DOES, and the reasoning matters';

if (content.includes(marker)) {
    content = content.replace(marker, replacement);
    fs.writeFileSync(path, content, 'utf-8');
    console.log('ch10-monorepo h4s added');
} else {
    console.log('ch10-monorepo marker NOT found');
}