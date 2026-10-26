/* Extract the group -> guides catalog from index.html for the shared GUIDES menu. */
'use strict';
const fs = require('fs');

const s = fs.readFileSync('index.html', 'utf8');
const groups = [];

const bandRe = /<section class="am-band" id="cat-([^"]+)" data-cat="[^"]*"[^>]*>([\s\S]*?)<\/section>/g;
let m;
while ((m = bandRe.exec(s))) {
  const id = m[1];
  const body = m[2];
  const nameRe = /<h2 class="am-h2"[^>]*>([^<]+)</.exec(body);
  const cards = [];
  const cardRe = /<article class="am-card" data-cat="[^"]*" data-file="([^"]+)"[\s\S]*?<strong>([^<]+)<\/strong>/g;
  let c;
  while ((c = cardRe.exec(body))) {
    cards.push([c[1], c[2].trim()]);
  }
  groups.push({ id, name: nameRe ? nameRe[1].trim() : id, guides: cards });
}

for (const g of groups) {
  console.log(`  { id: '${g.id}', name: '${g.name}', guides: [`);
  for (const [f, n] of g.guides) {
    console.log(`    ['${f}', ${JSON.stringify(n)}],`);
  }
  console.log('  ] },');
}
console.log('// total groups:', groups.length);