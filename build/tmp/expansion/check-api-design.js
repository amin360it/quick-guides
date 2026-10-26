const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');
const main = html.slice(html.indexOf('<main id="content">'));

const chapters = [
  ['orientation', '<h2 id="ch1"'],
  ['ch1', '<h2 id="ch2"'],
  ['ch2', '<h2 id="ch3"'],
  ['ch3', '<h2 id="ch4"'],
  ['ch4', '<h2 id="ch5"'],
  ['ch5', '<h2 id="ch6"'],
];

let problems = 0;
for (const [ch, nextMark] of chapters) {
  const start = main.indexOf('<h2 id="' + ch + '"');
  if (start < 0) { console.log('==', ch, 'NOT FOUND =='); continue; }
  // find the chapter section end: the next chapter <h2> OR the end of main
  let end = main.indexOf(nextMark, start);
  if (end < 0) end = main.indexOf('</main>', start);
  if (end < 0) end = main.length;
  const block = main.slice(start, end);
  console.log('== ' + ch + ' ==');
  const h3re = /<h3 id="([^"]+)"[^>]*>/g;
  let m;
  const positions = [];
  while ((m = h3re.exec(block))) positions.push({ id: m[1], idx: m.index });
  if (positions.length === 0) { console.log('  (no h3 sections)'); continue; }
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const endPos = i + 1 < positions.length ? positions[i + 1].idx : block.length;
    const seg = block.slice(p.idx, endPos);
    const h4 = (seg.match(/<h4/g) || []).length;
    const code = (seg.match(/class="codeWrap"/g) || []).length;
    const flag = h4 >= 2 && code >= 2 ? 'ok' : '*** PROBLEM ***';
    if (flag !== 'ok') problems++;
    console.log('  ' + p.id + ': h4=' + h4 + ' code=' + code + '  ' + flag);
  }
}
console.log('\nProblems: ' + problems);