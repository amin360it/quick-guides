const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !['index.html', 'topics.html', 'search.html'].includes(f));
const results = [];
files.forEach(f => {
  const s = fs.readFileSync(f, 'utf8');
  const h3 = (s.match(/<h3 id=/g) || []).length;
  const h4 = (s.match(/<h4 /g) || []).length;
  const hasTheme = s.includes('data-theme');
  const hasMode = s.includes('data-mode');
  const hasAmBand = s.includes('am-band');
  const hasSidebar = s.includes('id="sidebar"');
  const codeWrap = (s.match(/<div class="codeWrap"/g) || []).length || 0;
  results.push({ file: f, h3: h3, h4: h4, theme: hasTheme, mode: hasMode, amBand: hasAmBand, sidebar: hasSidebar, codeWrap: codeWrap });
});
results.sort((a, b) => b.h3 - a.h3);
results.forEach(r => console.log(r.file + ': h3=' + r.h3 + ' h4=' + r.h4 + ' theme=' + r.theme + ' mode=' + r.mode + ' amBand=' + r.amBand + ' sidebar=' + r.sidebar + ' codeWrap=' + r.codeWrap));