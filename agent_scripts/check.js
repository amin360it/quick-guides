const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
console.log('ch1 count:', (s.match(/id="ch1"/g)||[]).length);
console.log('ch1-fix1 count:', (s.match(/id="ch1-fix1"/g)||[]).length);
console.log('ch6 count:', (s.match(/id="ch6"/g)||[]).length);
console.log('ch6-fix1 count:', (s.match(/id="ch6-fix1"/g)||[]).length);