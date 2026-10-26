/* fixarrow.js — the arrow in the Browse Guides search link was lost in
 * transit and the escape form never landed either. Write the literal
 * characters by code point so nothing depends on the transport.
 *
 * Run: node build/tmp/fixarrow.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const JS = path.join(__dirname, '..', '..', 'assets', 'shell.js');
let src = fs.readFileSync(JS, 'utf8');

const GOOD = "var searchLink = el('a', 'tn-menu-note', 'Search everything " +
  String.fromCharCode(0x2192) + "');";

const re = /var searchLink = el\('a', 'tn-menu-note', 'Search everything[^']*'\);/;
const m = src.match(re);
if (!m) { console.error('FAIL: searchLink declaration not found'); process.exit(1); }
if (m[0] === GOOD) { console.log('OK: already correct'); process.exit(0); }

src = src.replace(re, () => GOOD);
if (src.indexOf(GOOD) === -1) { console.error('FAIL: replacement did not land'); process.exit(1); }
fs.writeFileSync(JS, src, 'utf8');
console.log('OK: arrow restored via code point');
