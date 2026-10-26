const fs = require('fs');
let c = fs.readFileSync('package-publishing.html', 'utf-8');

// Check ch9-devpi
let i = c.indexOf('<h3 id="ch9-devpi" data-toc>');
if (i >= 0) {
    console.log('h3 found');
    console.log(c.substring(i, i + 300));
}
let h4regex = /<h4 id="ch9-devpi-/g;
let h4matches = c.match(h4regex);
console.log('ch9-devpi h4 count:', h4matches ? h4matches.length : 0);

// Check other chapters
['ch9-artifactory', 'ch9-github', 'ch9-auth', 'ch9-proxy', 'ch9-migrate'].forEach(p => {
    let regex = new RegExp('<h4 id="' + p + '-', 'g');
    let m = c.match(regex);
    console.log(p + ' h4 count:', m ? m.length : 0);
});