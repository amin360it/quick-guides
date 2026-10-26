var fs = require('fs');
var c = fs.readFileSync('assets/shell.js.new', 'utf8');

console.log('=== literal "REMOVED" occurrences: ' + (c.match(/REMOVED/g) || []).length + ' ===');
var re = /REMOVED/g, m;
while ((m = re.exec(c))) {
  console.log('  @' + m.index + '  ' + JSON.stringify(c.slice(Math.max(0, m.index - 130), m.index + 40).replace(/\r\n/g, ' | ')));
}

console.log('\n=== how does .new build the Guides menu? ===');
var keys = ['GUIDES_CATALOG', 'var GUIDES', 'GUIDES =', 'tn-cat-h', 'guides-meta', 'GUIDE_LIST', 'TN_GROUPS', 'tn-groups'];
keys.forEach(function (k) {
  console.log('  ' + (k + '                    ').slice(0, 22) + (c.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length);
});

console.log('\n=== the nav IIFE: what array does it iterate? ===');
var at = c.indexOf('Shared top navigation bar');
console.log(c.slice(at, at + 2600).replace(/\r\n\r\n\r\n/g, '\n').replace(/\r\n/g, '\n'));
