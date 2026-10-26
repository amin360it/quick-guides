const fs = require('fs');
const html = fs.readFileSync('api-design.html', 'utf8');

const start = html.indexOf('<h2 id="orientation"');
const end = html.indexOf('<h2 id="ch6"');
const region = html.slice(start, end);

let fails = 0;
const bad = (msg) => { console.log('FAIL: ' + msg); fails++; };

// all code blocks within the region
const codeRe = /<div class="codeWrap"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
let m, i = 0;
while ((m = codeRe.exec(region))) {
  i++;
  const code = m[1];
  if (/<(?![\/a-zA-Z!])/.test(code)) bad(`raw '<' in region code block #${i}`);
  const badAmp = code.match(/&(?!amp;|lt;|gt;|quot;|#\d+;|nbsp;)/g);
  if (badAmp) bad(`bare '&' in region code block #${i}`);
  if (/&amp;(amp|lt|gt|quot|#)/.test(code)) bad(`double-escape in region code block #${i}`);
  const head = code.slice(0, 200);
  if (head.length >= 20 && code.indexOf(head, 20) !== -1) {
    bad(`repeat (first 200 chars recur) in region code block #${i}`);
  }
}
console.log('region code blocks:', i);

// h4/h3/h2 balance in region
const h4o = (region.match(/<h4/g) || []).length, h4c = (region.match(/<\/h4>/g) || []).length;
const h3o = (region.match(/<h3/g) || []).length, h3c = (region.match(/<\/h3>/g) || []).length;
const h2c = (region.match(/<\/h2>/g) || []).length, h2o = (region.match(/<h2/g) || []).length;
if (h4o !== h4c) bad(`h4 balance ${h4o}/${h4c}`);
if (h3o !== h3c) bad(`h3 balance ${h3o}/${h3c}`);
if (h2o !== h2c) bad(`h2 balance ${h2o}/${h2c}`);
console.log('h2', h2o, h2c, ' h3', h3o, h3c, ' h4', h4o, h4c);

// all ids in region unique
const ids = {};
const idRe = /<h[1-6][^>]*\bid="([^"]+)"/g;
while ((m = idRe.exec(region))) (ids[m[1]] = (ids[m[1]] || 0) + 1);
const dup = Object.entries(ids).filter(([, n]) => n > 1);
if (dup.length) bad('duplicate ids in region: ' + dup.map(([id, n]) => `${id}x${n}`).join(', '));
console.log('region heading ids:', Object.keys(ids).length);

// callout classes in region
const callouts = (region.match(/class="(tip|warn|note|ex)"/g) || []).length;
console.log('callouts in region:', callouts);

console.log(fails === 0 ? '\nREGION CHECKS PASSED' : '\n' + fails + ' FAILURE(S)');