const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');
// Find all heading elements with ids outside code blocks
const noCode = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
// Find all <h2>, <h3>, <h4> elements with ids
const headings = [...noCode.matchAll(/<(h[234])[^>]*\sid="([^"]+)"/g)].reverse();
// Group by id, but only keep entries with valid ids
const byId = {};
for (const h of headings) {
  if (!h[1] || !h[2]) continue; // skip if no tag or id
  const tag = h[1];
  const id = h[2];
  if (!byId[id]) byId[id] = [];
  byId[id].push({ tag, pos: h.index });
}
// For each duplicate id, make the second occurrence unique
for (const [id, occs] of Object.entries(byId)) {
  if (occs.length <= 1) continue;
  // Keep the first occurrence as-is, make the rest unique
  for (let i = 1; i < occs.length; i++) {
    const oldId = occs[i].id;
    const newId = id + '-fix' + i;
    // Replace in the full HTML string
    const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('id="' + regexEscape(oldId) + '"', 'g');
    s = s.replace(regex, 'id="' + newId + '"');
  }
}
fs.writeFileSync('vue-nuxt-capacitor.html', s);
console.log('Fixed duplicate heading ids');
console.log('New h4 count:', (s.match(/<h4 id=/g) || []).length);
// Verify no more duplicates
const noCode2 = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
const allIds2 = [...noCode2.matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
const unique2 = new Set(allIds2);
console.log('Total heading ids:', allIds2.length);
console.log('Unique heading ids:', unique2.size);
console.log('Remaining duplicates:', allIds2.length - unique2.size);