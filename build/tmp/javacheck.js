const fs = require('fs');

const files = ['build/tmp/java.part1.html', 'build/tmp/java.part2.html', 'build/tmp/java.part3.html'];
const known = new Set(['p','h1','h2','h3','h4','h5','code','pre','div','span','section','table','tr','th','td','ul','ol','li','button','nav','strong','em','br','a','b','i','script','input','main','aside','header','footer','img','svg','path','circle','meta','link','html','head','body','title']);

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const open = (t.match(/<code>/g) || []).length;
  const close = (t.match(/<\/code>/g) || []).length;
  const h4 = (t.match(/<h4/g) || []).length;
  const sections = (t.match(/<section class="chapter">/g) || []).length;
  const h3 = (t.match(/<h3 /g) || []).length;
  const h2 = (t.match(/<h2 /g) || []).length;
  const cw = (t.match(/<div class="codeWrap"><pre><code>/g) || []).length;
  const tbOpen = (t.match(/<table>/g) || []).length;
  const tbClose = (t.match(/<\/table>/g) || []).length;
  console.log(f, { open, close, h4, sections, h2, h3, cw, tbOpen, tbClose });

  t.split('\n').forEach((ln, i) => {
    const o = (ln.match(/<code>/g) || []).length;
    const c = (ln.match(/<\/code>/g) || []).length;
    if (o !== c) console.log('  code-imbalance L' + (i + 1) + ' (' + o + '/' + c + '): ' + ln.slice(0, 160));
  });

  // non-escaped '<' that begins something not a known tag
  const re = /<([a-zA-Z][a-zA-Z0-9]*)/g;
  let m;
  while ((m = re.exec(t))) {
    const name = m[1].toLowerCase();
    if (!known.has(name)) {
      const ln = t.slice(0, m.index).split('\n').length;
      console.log('  unknown-tag L' + ln + ': <' + m[1] + '>  ...' + t.slice(Math.max(0,m.index-60), m.index+40).replace(/\n/g,' '));
    }
  }
}
