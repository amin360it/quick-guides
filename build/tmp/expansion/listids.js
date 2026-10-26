const fs = require('fs');
const h = fs.readFileSync('api-design.html', 'utf8');
const ids = [...h.matchAll(/<h4 id="(ch1[0-2]-[^"]+)"/g)].map((x) => x[1]);
const g = {};
for (const id of ids) {
  const k = id.split('-').slice(0, 2).join('-');
  (g[k] = g[k] || []).push(id);
}
for (const k of Object.keys(g)) console.log(k + ' (' + g[k].length + '): ' + g[k].join(', '));
console.log('TOTAL ' + ids.length);
