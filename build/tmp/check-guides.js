const fs = require('fs');
const files = ['jquery.html', 'bootstrap5.html', 'html.html', 'javascript.html', 'css.html'];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const h3 = (s.match(/<h3 id=/g) || []).length;
  const h4 = (s.match(/<h4 id=/g) || []).length;
  const code = (s.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const ch = (s.match(/<section class="chapter">/g) || []).length;
  console.log(f + ': ch=' + ch + ' h3=' + h3 + ' h4=' + h4 + ' code=' + code);
}