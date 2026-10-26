var fs = require('fs');
var files = fs.readdirSync('.').filter(function (f) { return /\.html$/.test(f); });

var count = {
  hlSpan: 0, chTocOpen: 0, chTocCollapsed: 0, toTop: 0, progress: 0,
  tocList: 0, chTocHead: 0, dataToc: 0, searchAuto: 0, favBtn: 0, botnav: 0
};

files.forEach(function (f) {
  var c = fs.readFileSync(f, 'utf8');
  count.hlSpan += (c.match(/<span class="[ksnc]">/g) || []).length;
  count.chTocOpen += (c.match(/<div class="ch-toc">/g) || []).length;
  count.chTocCollapsed += (c.match(/<div class="ch-toc collapsed">/g) || []).length;
  count.toTop += (c.match(/id="toTop"/g) || []).length;
  count.progress += (c.match(/id="progress"/g) || []).length;
  count.tocList += (c.match(/class="ch-toc-list"/g) || []).length;
  count.chTocHead += (c.match(/class="ch-toc-head"/g) || []).length;
  count.dataToc += (c.match(/\sdata-toc(?=[\s>])/g) || []).length;
  count.searchAuto += (c.match(/id="searchAuto"/g) || []).length;
  count.favBtn += (c.match(/id="favBtn"/g) || []).length;
  count.botnav += (c.match(/id="botnav"|class="botnav"/g) || []).length;
});

console.log('across ' + files.length + ' pages:');
Object.keys(count).forEach(function (k) {
  console.log('  ' + (k + '                     ').slice(0, 22) + count[k]);
});

var css = fs.readFileSync('assets/shell.css', 'utf8');
console.log('\n--- CSS rules that hide .ch-toc-list ---');
var rules = css.match(/[^{}]*\{[^}]*\}/g) || [];
rules.forEach(function (r) {
  if (r.indexOf('ch-toc') < 0) return;
  if (!/collapsed|display\s*:\s*none/.test(r)) return;
  console.log('  ' + r.replace(/\s+/g, ' ').trim().slice(0, 170));
});

console.log('\n--- .to-top rules ---');
rules.forEach(function (r) {
  if (!/\.to-top/.test(r)) return;
  console.log('  ' + r.replace(/\s+/g, ' ').trim().slice(0, 170));
});
