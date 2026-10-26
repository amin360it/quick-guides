const fs = require('fs');
const s = fs.readFileSync('nextjs.html', 'utf8');

// every code sample
const re = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, n = 0, bad = 0;
const samples = [];
while ((m = re.exec(s))) {
  samples.push({ i: n, text: m[1], at: m.index });
  n++;
}
console.log('code samples found:', n);

for (const sm of samples) {
  const t = sm.text;
  const issues = [];
  // raw < or > inside a sample (both must be escaped)
  if (/</.test(t)) issues.push('raw <');
  if (/>/.test(t)) issues.push('raw >');
  // double-escaped entities
  if (/&amp;amp;|&amp;lt;|&amp;gt;|&amp;quot;|&amp;#/.test(t)) issues.push('double-escaped entity');
  // bare ampersand not starting an entity
  const bare = t.replace(/&(?:amp|lt|gt|quot|#\d+|#x[0-9a-fA-F]+);/g, '');
  if (/&/.test(bare)) issues.push('bare &');
  if (issues.length) {
    bad++;
    console.log('--- sample', sm.i, 'issues:', issues.join(', '));
    console.log(t.slice(0, 220).replace(/\n/g, '\\n'));
  }
}
console.log('samples with escaping issues:', bad);

// specifically the sections I added
for (const id of ['ch5-intercepting-matchers','ch5-intercepting-rule','ch5-navigation-link','ch5-navigation-hooks','ch5-links-what','ch5-links-optout','ch5-middleware-place','ch5-middleware-do']) {
  const present = s.includes(`<h4 id="${id}"`);
  console.log((present ? 'OK  ' : 'MISSING ') + id);
}
