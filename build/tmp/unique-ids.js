const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
// Find all heading elements with ids outside code blocks
const noCode = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
// Find all <h2>, <h3>, <h4> elements with ids
const headings = [...noCode.matchAll(/<(h[234])[^>]*\sid="([^"]+)"/g)];
// Build a map of id -> count and positions
const idMap = {};
for (const m of headings) {
  const id = m[2];
  if (!idMap[id]) idMap[id] = [];
  idMap[id].push(m.index);
}
// For each id with duplicates, make all but the first occurrence unique
for (const [id, positions] of Object.entries(idMap)) {
  if (positions.length <= 1) continue;
  // Keep the first occurrence as-is, make the rest unique
  for (let i = 1; i < positions.length; i++) {
    const oldId = id;
    const newId = id + '-u' + i;
    // Replace the i-th occurrence
    let count = 0;
    s = s.replace(new RegExp('id="' + oldId + '"', 'g'), function() {
      count++;
      return count === i ? 'id="' + newId + '"' : 'id="' + oldId + '"';
    });
  }
}
fs.writeFileSync('vue-nuxt-capacitor.html', s);
console.log('Made all heading ids unique');
console.log('New h4 count:', (s.match(/<h4 id=/g) || []).length);
// Verify
const noCode2 = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
const allIds = [...noCode2.matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
const unique = new Set(allIds);
console.log('Total heading ids:', allIds.length);
console.log('Unique heading ids:', unique.size);
console.log('Remaining duplicates:', allIds.length - unique.size);