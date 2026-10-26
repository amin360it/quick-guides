/* updateicons.js — add 8 WEB BASICS marks to the spliced GUIDE_ICONS literal
 * in assets/shell.js. Idempotent: refuses if a key is already present.
 * Run: node build/tmp/updateicons.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const JS = path.join(ROOT, 'assets', 'shell.js');
let src = fs.readFileSync(JS, 'utf8');

const NEW = {
  'website-seo.html':
    '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
  'digital-marketing.html':
    '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/>',
  'website-design.html':
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  'website-development.html':
    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'webapp-design.html':
    '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  'web-app-development.html':
    '<polyline points="4 17 10 11 4 5"/><polyline points="20 17 14 11 20 5"/><line x1="12" y1="3" x2="12" y2="21"/>',
  'website-webapp-deployment.html':
    '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'static-dynamic-website-development.html':
    '<path d="M12 2v6"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M12 14v8"/>'
};

const LIT = 'var GUIDE_ICONS = {';
const at = src.indexOf(LIT);
if (at === -1) { console.error('FAIL: GUIDE_ICONS literal not found'); process.exit(1); }
for (const k of Object.keys(NEW)) {
  if (src.indexOf('"' + k + '"') !== -1) {
    console.error('FAIL: ' + k + ' already present — refusing to double-write');
    process.exit(1);
  }
}

/* splice each entry just after the opening brace, before the first existing key */
const insertAt = at + LIT.length;
const block = Object.keys(NEW)
  .map(k => '  "' + k + '":\'' + NEW[k] + '\'')
  .join(',\n');
src = src.slice(0, insertAt) + '\n' + block + ',' + src.slice(insertAt);

fs.writeFileSync(JS, src, 'utf8');
console.log('OK: 8 new guide marks added to GUIDE_ICONS (' + (src.length) + ' bytes)');
