const fs = require('fs');
const p = 'build/tmp/ch19.html';
let s = fs.readFileSync(p, 'utf8');
const before = s.length;
// move the section close from before the .ex block to after it
const bad = 'hit a deleted chunk.</code></pre></div>\n    </section>\n\n    <div class="ex"';
const good = 'hit a deleted chunk.</code></pre></div>\n\n    <div class="ex"';
if (!s.includes(bad)) { console.log('P1 not found'); process.exit(1); }
s = s.split(bad).join(good);
const tail = '    </ol></div>';
const i = s.lastIndexOf(tail);
if (i < 0 || s.slice(i + tail.length).trim() !== '') { console.log('P2 not found or trailing content'); process.exit(1); }
s = s.slice(0, i + tail.length) + '\n  </section>' + s.slice(i + tail.length);
fs.writeFileSync(p, s);
console.log('ok delta', s.length - before);
