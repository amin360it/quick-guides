// Keyword-presence audit: for each guide, checks whether the guide's
// primary subject (from the am-band-t span) appears in the <title> and
// meta description. Reports gaps so you can add the words intentionally.
//
// Dry-run unless --write (writes a per-file patched <head> with the subject
// keyword inserted into title/description where missing).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WRITE = process.argv.includes('--write');

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !/^favorites|test|search/.test(f) && !/\.bak$/.test(f)).sort();

const audit = [];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const hEnd = s.indexOf('</head>');
  const head = s.slice(0, hEnd);
  const body = s.slice(hEnd);

  // subject from am-band-t
  const bandT = (head.match(/<span class="am-band-t">([\s\S]*?)<\/span>/) || [])[1] || '';
  const subject = (bandT ? bandT.match(/[^\s,]+/)[0] || '').trim() : '';
  if (!subject) { audit.push({ f, title: '', desc: '', subject: '(none)', titleOk: false, descOk: false }); continue; }

  const title = ((head.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const desc = (head.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1] || '';

  const titleLc = title.toLowerCase();
  const descLc = desc.toLowerCase();
  const subLc = subject.toLowerCase();

  const titleOk = titleLc.includes(subLc) || // exact word
    // or the subject tokens appear as separate words
    subject.split(/\s+/).some(w => titleLc.includes(w));
  const descOk = descLc.includes(subLc) ||
    subject.split(/\s+/).some(w => descLc.includes(w));

  audit.push({ f, title, desc, subject, titleOk, descOk });
}

let gaps = 0;
for (const a of audit) {
  const status = (a.titleOk ? 'OK' : 'GAP') + ' | ' + (a.descOk ? 'OK' : 'GAP');
  if (!a.titleOk || !a.descOk) gaps++;
  console.log(`  ${status}  ${a.f.padEnd(40)} subj="${a.subject}"`);
}
console.log(`\n${audit.length} guides audited | gaps: ${gaps}`);

if (WRITE) {
  // For each gap, inject the subject keyword into title and description
  for (const a of audit) {
    if (a.titleOk && a.descOk) continue;
    let s = fs.readFileSync(path.join(ROOT, a.f), 'utf8');
    const hEnd = s.indexOf('</head>');
    let head = s.slice(0, hEnd);
    // inject into <title>
    if (!a.titleOk) {
      // insert subject before the first ' - ' or at start/end
      head = head.replace(/<title>([\s\S]*?)<\/title>/, `<title>${a.subject} ${a.title.replace('<title>', '').replace('</title>', '')}</title>`);
    }
    // inject into description meta
    if (!a.descOk) {
      const existing = a.desc || '';
      head = head.replace(
        /(<meta\s+name="description"\s+content=")[^"]*(")/,
        `$1${a.subject}: ${existing}$2`
      );
    }
    fs.writeFileSync(path.join(ROOT, a.f), head + s.slice(hEnd));
    console.log(`  written ${a.f}`);
  }
  console.log('Write complete.');
}