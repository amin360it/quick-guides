var fs = require('fs');
var h = fs.readFileSync('build/tmp/dump-index.html', 'utf8');
function n(re) { return (h.match(re) || []).length; }

console.log('=== index.html rendered ===');
console.log('  .am-card                    : ' + n(/class="am-card"/g));
console.log('  card marks (svg in am-card-ic): ' + n(/am-card-ic"><svg class="am-glyph"/g));
console.log('  total .am-glyph              : ' + n(/class="am-glyph"/g));
console.log('  cards still holding a letter : ' + n(/am-card-ic">[A-Z]<\/span>/g));
console.log('  .botnav                      : ' + n(/class="botnav"/g));
console.log('  #toTop                       : ' + n(/id="toTop"/g));
console.log('  #progressBar                 : ' + n(/id="progressBar"/g));
console.log('  .tn-link rows                : ' + n(/class="tn-link/g));

// pull one hydrated card to eyeball it
var i = h.indexOf('am-card-ic"><svg');
if (i > 0) console.log('\n  first hydrated card: ' + h.slice(i - 120, i + 260).replace(/\s+/g, ' '));
