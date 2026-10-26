const fs = require('fs');
const count = (h) => {
  const body = h.slice(h.indexOf('<body'));
  const main = body.slice(body.indexOf('<main'), body.indexOf('</main>'));
  return main.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean).length;
};
const oldN = count(fs.readFileSync('build/bak/react.html.pre-splice', 'utf8'));
const now = fs.readFileSync('react.html', 'utf8');
const newN = count(now);
const adjusted = 18972 + (newN - oldN);
console.log('method old', oldN, 'new', newN, 'delta', newN - oldN, '-> wordCount', adjusted);
const out = now.replace(/"wordCount":\d+/, () => '"wordCount":' + adjusted);
fs.writeFileSync('react.html', out);
console.log('written');
