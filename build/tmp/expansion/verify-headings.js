const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');
const start = html.indexOf('<h2 id="orientation"');
const end = html.indexOf('<h2 id="ch6"');
const region = html.slice(start, end);

const h2s = [...region.matchAll(/<h2 id="([^"]+)"( data-toc)?[^>]*>([^<]*)<\/h2>/g)];
console.log('H2 headings in region:');
for (const m of h2s) console.log(`  ${m[1]} data-toc=${!!m[2]} | ${m[3]}`);

const h3s = [...region.matchAll(/<h3 id="([^"]+)"( data-toc)?[^>]*>([^<]*)<\/h3>/g)];
console.log('\nh3 count:', h3s.length,
  ' with data-toc:', h3s.filter((m) => m[2]).length);
const noToc = h3s.filter((m) => !m[2]).map((m) => m[1]);
if (noToc.length) console.log('h3 missing data-toc:', noToc.join(', '));

// every h4 has an id
const h4s = [...region.matchAll(/<h4(?:\s+id="([^"]+)")?[^>]*>/g)];
console.log('h4 count:', h4s.length,
  ' with id:', h4s.filter((m) => m[1]).length);
const noId = h4s.filter((m) => !m[1]).length;
console.log('h4 without id:', noId);