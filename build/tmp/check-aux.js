'use strict';
const fs = require('fs');
for (const f of ['favorites.html', 'search.html', 'static-dynamic-website-development.html']) {
  const s = fs.readFileSync(f, 'utf8');
  const title = (s.match(/<title>([^<]+)/) || [])[1];
  const band = s.includes('<h1 class="am-band"');
  const ch = s.includes('class="chapter"');
  const heading = (s.match(/<h1[^>]*>([\s\S]{0,80})/) || [])[1];
  console.log(f, '| title:', title, '| am-band:', band, '| chapter:', ch, '| h1:', JSON.stringify(heading));
}