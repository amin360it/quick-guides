const fs = require('fs');

const s = fs.readFileSync('index.html', 'utf8');
const idx = s.indexOf('Advanced Architecture');
console.log('CONTEXT:', JSON.stringify(s.slice(idx - 25, idx + 25)));

const seg = s.slice(idx - 12, idx);
console.log('\nCODEPOINTS before "Advanced Architecture":');
for (const ch of seg) {
  const cp = ch.codePointAt(0);
  const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
  console.log(`  ${JSON.stringify(ch)}  ${hex}  code=${cp}`);
}

// Try a CP1252 reverse-decode
const CP = {0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};

function cp1252Bytes(str) {
  const out = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xFF) out.push(cp);
    else if (CP[cp] !== undefined) out.push(CP[cp]);
    else return null;
  }
  return Buffer.from(out);
}

function decodeOnce(str) {
  const b = cp1252Bytes(str);
  if (!b) return null;
  const d = b.toString('utf8');
  if (d.includes('\uFFFD')) return null;
  return d;
}

let cur = seg;
for (let i = 1; i <= 3; i++) {
  const d = decodeOnce(cur);
  if (d === null) { console.log(`\nPass ${i}: decode failed (not mojibake or invalid)`); break; }
  console.log(`\nPass ${i}: ${JSON.stringify(cur)} -> ${JSON.stringify(d)}`);
  if (d === cur) break;
  cur = d;
}
