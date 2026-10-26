const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
// Find all heading ids (outside code blocks)
const noCode = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
const allIds = [...noCode.matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
// Count by prefix
const byPrefix = {};
for (const id of allIds) {
  const prefix = id.split('-')[0];
  byPrefix[prefix] = (byPrefix[prefix] || 0) + 1;
}
console.log('Heading ids by prefix:');
for (const [prefix, count] of Object.entries(byPrefix).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + prefix + ':', count);
}
// Show ids that appear more than once
const counts = {};
for (const id of allIds) {
  counts[id] = (counts[id] || 0) + 1;
}
const multi = Object.entries(counts).filter(([id, c]) => c > 1);
console.log('\nIds appearing more than once (' + multi.length + ' total):');
for (const [id, count] of multi) {
  console.log('  ' + id + ': ' + count);
}