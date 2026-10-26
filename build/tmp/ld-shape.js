'use strict';
const fs = require('fs');
// Inspect the JSON-LD hasPart shape on a healthy guide.
const s = fs.readFileSync('php.html', 'utf8');
const ld = (s.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
const j = JSON.parse(ld);
const art = j['@graph'] ? j['@graph'][0] : j;
console.log('hasPart length:', Array.isArray(art.hasPart) ? art.hasPart.length : 'none');
console.log('first hasPart:', JSON.stringify((art.hasPart || [])[0]).slice(0, 300));
console.log('wordCount:', art.wordCount, '| keywords:', JSON.stringify(art.keywords));
// also check how many chapters: count h2 data-toc in main
console.log('h2 data-toc in file:', (s.match(/<h2[^>]*data-toc/g) || []).length);