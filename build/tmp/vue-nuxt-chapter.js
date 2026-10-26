'use strict';
const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
const parts = s.split('<section class="chapter">').slice(1);
for (let i = 0; i < parts.length; i++) {
  const idm = /<h2 id="([^"]+)"/.exec(parts[i]);
  const h3 = (parts[i].match(/<h3 id=/g) || []).length;
  const h4 = (parts[i].match(/<h4 id=/g) || []).length;
  console.log((idm ? idm[1] : '?'), 'h3=' + h3, 'h4=' + h4);
}