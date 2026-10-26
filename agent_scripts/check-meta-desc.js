'use strict';
// Check the description length of every build/newguides/*.meta.json
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '..', 'build', 'newguides');
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.meta.json'))) {
  const m = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const len = m.description.length;
  const flag = len >= 148 && len <= 156 ? 'ok  ' : 'BAD ';
  console.log(flag + f.padEnd(30) + len);
}
