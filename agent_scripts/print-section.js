'use strict';
// Print the whole h3 (or h2) section named by an id, to stdout.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const s = fs.readFileSync(path.join(ROOT, process.argv[2]), 'utf8');
const id = process.argv[3];
const at = s.indexOf('id="' + id + '"');
if (at < 0) { console.error('id not found: ' + id); process.exit(1); }
const next = s.indexOf('<h3 ', at + 10);
const end = next < 0 ? s.length : next;
process.stdout.write(s.slice(Math.max(0, at - 30), end));
