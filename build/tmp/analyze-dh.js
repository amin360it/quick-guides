const fs = require('fs');
const s = fs.readFileSync('domains-hosting.html', 'utf8');
// Find all chapter sections
const chapters = [];
let pos = 0;
while (true) {
  const start = s.indexOf('<section class="chapter">', pos);
  if (start < 0) break;
  const end = s.indexOf('</section>', start);
  if (end < 0) break;
  chapters.push(s.slice(start, end + '</section>'.length));
  pos = end + '</section>'.length;
}

console.log('Found', chapters.length, 'chapters');

// For each chapter, count h3 and h4
for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  const h3Count = (ch.match(/<h3 id=/g) || []).length;
  const h4Count = (ch.match(/<h4 id=/g) || []).length;
  const firstH3 = ch.match(/<h3 id="([^"]+)"/);
  console.log('Ch', i+1, ':', firstH3 ? firstH3[1] : '?', 'h3=' + h3Count, 'h4=' + h4Count);
}