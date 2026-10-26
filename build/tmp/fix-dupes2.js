// Fix duplicate heading ids in vue-nuxt-capacitor.html
// Each duplicate appears exactly twice - replace the second occurrence with a unique id
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// For each duplicate id, replace the second occurrence with id + '-fix'
// Order matters - process from the bottom of the list so earlier replacements don't shift positions
const duplicates = [
  ['ch1', 'ch1-fix1'],
  ['ch1-spa', 'ch1-spa-fix1'],
  ['ch1-spa-pipeline', 'ch1-spa-pipeline-fix1'],
  ['ch1-spa-base', 'ch1-spa-base-fix1'],
  ['ch1-spa-chunks', 'ch1-spa-chunks-fix1'],
  ['ch1-nuxt', 'ch1-nuxt-fix1'],
  ['ch1-nuxt-modes', 'ch1-nuxt-modes-fix1'],
  ['ch1-nuxt-preset', 'ch1-nuxt-preset-fix1'],
  ['ch1-nuxt-cost', 'ch1-nuxt-cost-fix1'],
  ['ch1-choose', 'ch1-choose-fix1'],
  ['ch1-choose-table', 'ch1-choose-table-fix1'],
  ['ch1-choose-both', 'ch1-choose-both-fix1'],
  ['ch1-layers', 'ch1-layers-fix1'],
  ['ch1-origin', 'ch1-origin-fix1'],
  ['ch1-origin--exercises-2', 'ch1-origin--exercises-2-fix1'],
  ['ch2', 'ch2-fix1'],
  ['ch2-init', 'ch2-init-fix1'],
  ['ch2-config', 'ch2-config-fix1'],
  ['ch2-env', 'ch2-env-fix1'],
  ['ch2-structure', 'ch2-structure-fix1'],
  ['ch2-gitignore', 'ch2-gitignore-fix1'],
  ['ch2-gitignore--exercises-3', 'ch2-gitignore--exercises-3-fix1'],
  ['ch3', 'ch3-fix1'],
  ['ch3-reactivity', 'ch3-reactivity-fix1'],
  ['ch3-lifecycle', 'ch3-lifecycle-fix1'],
  ['ch3-keepalive', 'ch3-keepalive-fix1'],
  ['ch3-suspense', 'ch3-suspense-fix1'],
  ['ch3-plugins', 'ch3-plugins-fix1'],
  ['ch3-plugins--exercises-4', 'ch3-plugins--exercises-4-fix1'],
  ['ch4', 'ch4-fix1'],
  ['ch4-config', 'ch4-config-fix1'],
  ['ch4-shell', 'ch4-shell-fix1'],
  ['ch4-modules', 'ch4-modules-fix1'],
  ['ch4-data', 'ch4-data-fix1'],
  ['ch4-web', 'ch4-web-fix1'],
  ['ch4-web--exercises-5', 'ch4-web--exercises-5-fix1'],
  ['ch5', 'ch5-fix1'],
  ['ch5-history', 'ch5-history-fix1'],
  ['ch5-guard', 'ch5-guard-fix1'],
  ['ch5-modal', 'ch5-modal-fix1'],
  ['ch5-scrollback', 'ch5-scrollback-fix1'],
  ['ch5-transitions', 'ch5-transitions-fix1'],
  ['ch5-transitions--exercises-6', 'ch5-transitions--exercises-6-fix1'],
  ['ch6', 'ch6-fix1'],
  ['ch6-setup', 'ch6-setup-fix1'],
  ['ch6-shallow', 'ch6-shallow-fix1'],
  ['ch6-persist', 'ch6-persist-fix1'],
  ['ch6-async', 'ch6-async-fix1'],
  ['ch6-boundaries', 'ch6-boundaries-fix1'],
  ['ch6-boundaries--exercises-7', 'ch6-boundaries--exercises-7-fix1'],
];

for (const [oldId, newId] of duplicates) {
  // Escape the id for use in a regex
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('id="' + escapeRegex(oldId) + '"', 'g');
  s = s.replace(regex, 'id="' + newId + '"');
}

fs.writeFileSync('vue-nuxt-capacitor.html', s);
console.log('Fixed duplicate heading ids');
console.log('New h4 count:', (s.match(/<h4 id=/g) || []).length);
// Verify no more duplicates
const noCode = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '');
const allIds = [...noCode.matchAll(/<[a-zA-Z][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
const unique = new Set(allIds);
console.log('Total heading ids:', allIds.length);
console.log('Unique heading ids:', unique.size);
console.log('Remaining duplicates:', allIds.length - unique.size);