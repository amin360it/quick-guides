const fs = require('fs');
const s = fs.readFileSync('midjourney.html', 'utf8');
console.log('h3 count:', (s.match(/<h3 id=/g) || []).length);
console.log('h4 count:', (s.match(/<h4 /g) || []).length);
console.log('Has data-theme:', s.includes('data-theme'));
console.log('Has data-mode:', s.includes('data-mode'));
console.log('Has am-band:', s.includes('am-band'));
console.log('Has sidebar:', s.includes('id="sidebar"'));
console.log('Has codeWrap:', (s.match(/<div class="codeWrap"/g) || []).length || 0);