'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const head = s.slice(0, s.indexOf('</head>'));
  const t = ((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const d = (head.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';
  console.log('--- ' + f);
  console.log('T(' + t.length + '): ' + t);
  console.log('D(' + d.length + '): ' + d);
}
