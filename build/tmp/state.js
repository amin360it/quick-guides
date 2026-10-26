const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
const ch = (s.match(/<section class="chapter">/g) || []).length;
const h3 = (s.match(/<h3 id=/g) || []).length;
const h4 = (s.match(/<h4 id=/g) || []).length;
const code = (s.match(/<div class="codeWrap"><pre><code>/g) || []).length;
console.log('chapters=' + ch + ' h3=' + h3 + ' h4=' + h4 + ' code=' + code);