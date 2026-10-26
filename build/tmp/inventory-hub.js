// Inventory every class emitted/used by the two hub pages and hub.js,
// and report which are already styled by shell.css.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const shell = read('assets/shell.css') + '\n' + read('assets/hub.css');
const hubjs = read('assets/hub.js');
const pages = { 'index.html': read('index.html'), 'topics.html': read('topics.html') };

// styled selectors in shell.css
const styled = new Set();
for (const m of shell.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) styled.add(m[1]);

const use = new Map(); // class -> Set(pages)
const add = (c, where) => {
  if (!c) return;
  if (!use.has(c)) use.set(c, new Set());
  use.get(c).add(where);
};

for (const [file, html] of Object.entries(pages)) {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  for (const m of stripped.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].trim().split(/\s+/)) add(c, file);
}
// classes built in hub.js
for (const m of hubjs.matchAll(/class="([^"]+)"/g))
  for (const c of m[1].trim().split(/\s+/)) {
    if (!c.includes('${')) add(c, 'hub.js');
  }
for (const m of hubjs.matchAll(/class=\\?"([^"\\]+)\\?"/g))
  for (const c of m[1].trim().split(/\s+/)) add(c, 'hub.js');
for (const m of hubjs.matchAll(/classList\.(?:add|toggle|remove)\('([^']+)'/g)) add(m[1], 'hub.js');
// class="..." inside template literals with concatenation
for (const m of hubjs.matchAll(/className\s*=\s*'([^']+)'/g))
  for (const c of m[1].trim().split(/\s+/)) add(c, 'hub.js');

const rows = [...use.entries()].map(([c, where]) => ({
  cls: c,
  where: [...where].join('+'),
  inShell: styled.has(c),
}));
const missing = rows.filter(r => !r.inShell).sort((a, b) => a.cls.localeCompare(b.cls));
const present = rows.filter(r => r.inShell).sort((a, b) => a.cls.localeCompare(b.cls));

console.log('== styled by shell.css (' + present.length + ') ==');
console.log(present.map(r => r.cls + ' [' + r.where + ']').join('\n'));
console.log('\n== NOT styled anywhere (' + missing.length + ') ==');
console.log(missing.map(r => r.cls + ' [' + r.where + ']').join('\n'));
