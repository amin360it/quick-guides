const fs = require('fs');
const s = fs.readFileSync(process.argv[2] || 'nextjs.html', 'utf8');
const cnt = (re) => (s.match(re) || []).length;
console.log('codeWrap open:', cnt(/<div class="codeWrap"><pre><code>/g));
console.log('pre open     :', cnt(/<pre(?:\s[^>]*)?>/g));
console.log('pre close    :', cnt(/<\/pre>/g));

// strip codeWrap blocks, then look for leaked code-comment lines
const stripped = s.replace(/<div class="codeWrap"><pre><code>[\s\S]*?<\/code><\/pre><\/div>/g, '@@BLOCK@@');
const mainStart = stripped.indexOf('<main id="content">');
const mainEnd = stripped.indexOf('</main>');
const main = stripped.slice(mainStart, mainEnd);
const lines = main.split('\n');
let leak = 0;
lines.forEach((l, i) => {
  if (/^\s*\/\//.test(l) || /^\s*(const|let|export|import|if|return|await|async) /.test(l)) {
    leak++;
    console.log('LEAK line', i + 1 + ':', JSON.stringify(l.slice(0, 100)));
  }
});
console.log('leaked code-line suspects outside codeWrap:', leak);

// count h4 and codeWrap per section again
const parts = s.slice(s.indexOf('<main id="content">'), s.indexOf('</main>')).split(/(?=<h3 id="[^"]+" data-toc>)/).filter(p => p.startsWith('<h3'));
let minH4 = 99, minCode = 99;
parts.forEach(p => {
  const h = (p.match(/<h4 id="/g) || []).length;
  const c = (p.match(/<div class="codeWrap">/g) || []).length;
  minH4 = Math.min(minH4, h); minCode = Math.min(minCode, c);
});
console.log('sections:', parts.length, 'min h4:', minH4, 'min codeWrap:', minCode);
