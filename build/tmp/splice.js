const fs = require('fs');

const SRC = 'react.html';
const BAK = 'build/bak/react.html.pre-splice';
const parts = ['ch11','ch12','ch13','ch14','ch15','ch16full','ch17','ch18','ch19'];

let s = fs.readFileSync(SRC, 'utf8');
if (fs.existsSync(BAK)) {
  if (fs.readFileSync(BAK, 'utf8') !== s) { console.log('backup exists and differs, refusing'); process.exit(1); }
} else fs.writeFileSync(BAK, s);

// ---------- gather fragment data ----------
const frags = parts.map(p => {
  const f = fs.readFileSync('build/tmp/' + p + '.html', 'utf8');
  const h2 = f.match(/<h2 id="(ch\d+)" data-toc>([^<]*)<\/h2>/);
  if (!h2) throw new Error('no h2 in ' + p);
  const h3s = [...f.matchAll(/<h3 id="([^"]+)" data-toc>([\s\S]*?)<\/h3>/g)].map(m => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, '').trim(),
  }));
  if (h3s.length < 4) throw new Error('too few h3 in ' + p);
  return { id: h2[1], title: h2[2], h3s, html: f };
});

// ---------- 1. splice body after ch10's section close ----------
const ch10i = s.indexOf('id="ch10"');
const closeI = s.indexOf('</section>', ch10i);
if (ch10i < 0 || closeI < 0) throw new Error('ch10 anchor');
const body = '\n' + frags.map(f => f.html.trim()).join('\n\n');
s = s.slice(0, closeI + '</section>'.length) + body + s.slice(closeI + '</section>'.length);

// ---------- 2. sidebar entries ----------
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lis = frags.map(f => {
  const items = f.h3s.map(h =>
    `<li><a href="#${h.id}" data-target="${h.id}">${esc(h.text)}</a></li>`).join('');
  return `<li class="chapter open"><span class="arrow">\u25B8</span><a href="#${f.id}" data-target="${f.id}">${esc(f.title)}</a><ul>${items}</ul></li>`;
}).join('');
const navEnd = s.indexOf('</ul></nav>');
if (navEnd < 0) throw new Error('nav end');
s = s.slice(0, navEnd) + lis + s.slice(navEnd);

// ---------- 3. band counts ----------
const fragToc = frags.reduce((n, f) => n + 1 + f.h3s.length, 0);
const fragCode = frags.reduce((n, f) => n + (f.html.match(/class="codeWrap"/g) || []).length, 0);
const chapters = 11 + frags.length;
const topics = 90 + fragToc;
const code = 85 + fragCode;
const bandOld = '11 chapters &middot; 90 topics &middot; 85 code samples';
const bandNew = `${chapters} chapters &middot; ${topics} topics &middot; ${code} code samples`;
if (!s.includes(bandOld)) throw new Error('band not found');
s = s.replace(bandOld, () => bandNew);

// ---------- 4. descriptions (identical string in 3 places) ----------
const dOld = '11 chapters, 90 topics and 85 code samples';
const dNew = `${chapters} chapters, ${topics} topics and ${code} code samples`;
const di = s.indexOf('name="description"');
const oldDesc = s.slice(di, di + 320).match(/content="([^"]*)"/)[1];
if (!oldDesc.includes(dOld)) throw new Error('desc numbers');
let newDesc = oldDesc.replace(dOld, () => dNew);
if (newDesc.length > 156) newDesc = newDesc.replace('look like right now,', 'look like now,');
if (newDesc.length > 156 || newDesc.length < 148) throw new Error('desc length ' + newDesc.length);
const nDesc = s.split(oldDesc).length - 1;
if (nDesc !== 4) throw new Error('expected 4 description copies (3 meta + JSON-LD), got ' + nDesc);
s = s.split(oldDesc).join(newDesc);
console.log('desc', oldDesc.length, '->', newDesc.length);

// ---------- 5. JSON-LD hasPart + wordCount ----------
const urlBase = 'https://amin360it.github.io/quick-guides/react.html#';
const entries = frags.map(f =>
  `,{"@type":"WebPageElement","name":${JSON.stringify(f.title)},"url":${JSON.stringify(urlBase + f.id)}}`).join('');
const hpIdx = s.indexOf('"hasPart":[');
if (hpIdx < 0) throw new Error('hasPart');
const hpClose = s.indexOf(']', hpIdx);
if (hpClose < 0) throw new Error('hasPart close');
s = s.slice(0, hpClose) + entries + s.slice(hpClose);

// wordCount: recompute main text words with the same heuristic as baseline
const mainStart = s.indexOf('<main id="content">');
const mainEnd = s.indexOf('</main>');
const mainHtml = s.slice(mainStart, mainEnd);
const text = mainHtml.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
const words = text.split(' ').filter(Boolean).length;
s = s.replace(/"wordCount":\d+/, () => '"wordCount":' + words);
console.log('wordCount ->', words, '(baseline 18972)');

fs.writeFileSync(SRC, s);
console.log('written', s.length, 'bytes (was', fs.readFileSync(BAK, 'utf8').length + ')');
console.log('counts:', chapters, 'chapters,', topics, 'topics,', code, 'code samples');
