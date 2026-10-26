const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
console.log('total h4:', (s.match(/<h4 id=/g)||[]).length);