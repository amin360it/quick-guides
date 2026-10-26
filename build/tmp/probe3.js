const fs = require('fs');
const s = fs.readFileSync('react.html', 'utf8');
for (const key of ['og:description', 'twitter:description', 'og:title']) {
  const i = s.indexOf('property="' + key + '"') >= 0 ? s.indexOf('property="' + key + '"') : s.indexOf('name="' + key + '"');
  console.log(key, ':', JSON.stringify(s.slice(i, i + 420)));
  console.log('---');
}
// orientation part map
const o = s.indexOf('id="orientation-map"');
console.log('MAP:', JSON.stringify(s.slice(o, o + 2600)));
