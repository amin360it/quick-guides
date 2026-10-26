const s = require('fs').readFileSync('index.html', 'utf8');
for (const id of ['cat-languages', 'cat-frontend', 'cat-devops', 'cat-ai', 'cat-web-basics']) {
  console.log(id.padEnd(16), 'at', s.indexOf(`id="${id}"`));
}
console.log('am-cards total', (s.match(/class="am-cards"/g) || []).length);
console.log('data-file total', (s.match(/data-file=/g) || []).length);
const m = s.match(/<article class="am-card"[\s\S]{0,700}?<\/article>/);
console.log('--- sample card ---');
console.log(m ? m[0] : 'none');
