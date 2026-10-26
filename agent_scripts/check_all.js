const fs = require('fs');
let c = fs.readFileSync('package-publishing.html', 'utf-8');

// Ch3 sections in chapters 9-11
// Chapter 9 h3s: ch9-when, ch9-why, ch9-satis, ch9-verdaccio, ch9-devpi, ch9-artifactory, ch9-github, ch9-auth, ch9-proxy, ch9-migrate
// Chapter 10 h3s: ch10-spectrum, ch10-ghreleases, ch10-direct, ch10-selfupdate, ch10-bins, ch10-os, ch10-monorepo, ch10-multi, ch10-oss, ch10-checklist
// Chapter 11 h3s: ch11-lifecycle, ch11-deprecate, ch11-unpublish, ch11-per-ecosystem, ch11-security, ch11-handover, ch11-funding, ch11-goal

// Check chapter 9 h3s
const ch9h3s = ['ch9-when', 'ch9-why', 'ch9-satis', 'ch9-verdaccio', 'ch9-devpi', 'ch9-artifactory', 'ch9-github', 'ch9-auth', 'ch9-proxy', 'ch9-migrate'];
ch9h3s.forEach(prefix => {
    let h3re = new RegExp('<h3 id="' + prefix + '" data-toc>', 'g');
    let h3count = (c.match(h3re) || []).length;
    let h4re = new RegExp('<h4 id="' + prefix + '-', 'g');
    let h4count = (c.match(h4re) || []).length;
    console.log(prefix + ': h3=' + h3count + ', h4=' + h4count);
});

// Check chapter 10 h3s
const ch10h3s = ['ch10-spectrum', 'ch10-ghreleases', 'ch10-direct', 'ch10-selfupdate', 'ch10-bins', 'ch10-os', 'ch10-monorepo', 'ch10-multi', 'ch10-oss', 'ch10-checklist'];
ch10h3s.forEach(prefix => {
    let h3re = new RegExp('<h3 id="' + prefix + '" data-toc>', 'g');
    let h3count = (c.match(h3re) || []).length;
    let h4re = new RegExp('<h4 id="' + prefix + '-', 'g');
    let h4count = (c.match(h4re) || []).length;
    console.log(prefix + ': h3=' + h3count + ', h4=' + h4count);
});

// Check chapter 11 h3s
const ch11h3s = ['ch11-lifecycle', 'ch11-deprecate', 'ch11-unpublish', 'ch11-per-ecosystem', 'ch11-security', 'ch11-handover', 'ch11-funding', 'ch11-goal'];
ch11h3s.forEach(prefix => {
    let h3re = new RegExp('<h3 id="' + prefix + '" data-toc>', 'g');
    let h3count = (c.match(h3re) || []).length;
    let h4re = new RegExp('<h4 id="' + prefix + '-', 'g');
    let h4count = (c.match(h4re) || []).length;
    console.log(prefix + ': h3=' + h3count + ', h4=' + h4count);
});