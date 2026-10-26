const fs = require('fs');
for (const f of ['build/tmp/pkg-ch10-11.html', 'build/tmp/pkg-ch10-11.utf8.html']) {
  const b = fs.readFileSync(f);
  console.log(f, 'len', b.length, 'first bytes', b.slice(0, 40).toString('hex'));
  // detect BOM
  console.log('  bom utf8?', b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF, 'utf16le?', b[0] === 0xFF && b[1] === 0xFE);
}
