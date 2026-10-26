'use strict';
// extract-section.js <file> <i,j,...>  — print the named chapters to stdout.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const [file, idxArg] = process.argv.slice(2);
const want = idxArg.split(',').map(Number);
const s = fs.readFileSync(path.join(ROOT, file), 'utf8');
const list = [...s.matchAll(/<section class="chapter">[\s\S]*?<\/section>/g)];
process.stdout.write(want.map((i) => list[i - 1][0]).join('\n'));
