const fs = require('fs');
const s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
// Find all real heading ids (outside code blocks)
const noCode = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
const allIds = [...noCode.matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
const unique = new Set(allIds);
const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
console.log('Total heading ids:', allIds.length);
console.log('Unique heading ids:', unique.size);
console.log('Duplicate ids:', dupes.length);
if (dupes.length > 0) {
  // Show first 10 dupes
  const seen = new Set();
  const dupList = [];
  for (const id of allIds) {
    if (seen.has(id)) {
      dupList.push(id);
    } else {
      seen.add(id);
    }
  }
  console.log('First 10 duplicates:', dupList.slice(0, 10));
}