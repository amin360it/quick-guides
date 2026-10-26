var fs = require('fs');
// Regression test: reintroduce the defect in a COPY and confirm check-guide.js
// now fails. A tightened check that does not fail on the original fault is
// worse than no check.
var src = fs.readFileSync('idea-to-deploy.html','utf8');
var broken = src.split(' data-toc>').join(' data-toc">');
var n = (broken.match(/data-toc"/g)||[]).length;
console.log('injected ' + n + ' defects into a copy');
fs.writeFileSync('build/tmp/_regress.html', broken, 'utf8');