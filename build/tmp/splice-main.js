'use strict';
/* splice-main.js <page.html> <newmain.txt>
   Replaces everything between the h1 band block and </main> in page.html with
   the content of newmain.txt. The h1 block itself is preserved byte-identical;
   everything outside <main> is untouched. Use with regentoc.js --write after.
   Usage: node splice-main.js <page> <mainfile> [--write]
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const page = process.argv[2];
const mainFile = process.argv[3];
const doWrite = process.argv.includes('--write');
if (!page || !mainFile) { console.log('usage: node splice-main.js <page.html> <newmain.txt> [--write]'); process.exit(1); }

const p = path.isAbsolute(page) ? page : path.join(ROOT, page);
let s = fs.readFileSync(p, 'utf8');

const mainStart = s.indexOf('<main id="content">');
const mainEnd = s.indexOf('</main>');
if (mainStart < 0 || mainEnd < 0) throw new Error(page + ': no <main>');

const h1Start = s.indexOf('<h1 class="am-band">', mainStart);
const h1End = s.indexOf('</h1>', h1Start);
if (h1Start < 0 || h1End < 0) throw new Error(page + ': no h1 am-band');
const h1Block = s.slice(h1Start, h1End + '</h1>'.length);

const newMain = fs.readFileSync(mainFile, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';

// build replacement: main open + h1 + new content + close
const replacement = '<main id="content">\n' + h1Block + '\n' + newMain + '</main>';

const before = s;
s = s.slice(0, mainStart) + replacement + s.slice(mainEnd + '</main>'.length);

if (s === before) { console.log(page + ': unchanged'); process.exit(0); }
console.log(page + ': main content replaced (' + h1Block.length + 'B h1 preserved, new body ' + newMain.length + 'B)');
if (doWrite) fs.writeFileSync(p, s);