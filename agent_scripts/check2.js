const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
const tags = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'];
for (const tag of tags) {
  const re = new RegExp('id="' + tag + '"', 'g');
  const count = (s.match(re) || []).length;
  const fixRe = new RegExp('id="' + tag + '-fix1"', 'g');
  const fixCount = (s.match(fixRe) || []).length;
  console.log(tag + ': original=' + count + ', fix1=' + fixCount);
}