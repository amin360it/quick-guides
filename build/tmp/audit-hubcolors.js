var fs = require('fs');
var css = fs.readFileSync('assets/hub.css', 'utf8');
var noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

// every declaration that names a colour literal instead of a token
var re = /([-a-zA-Z]+)\s*:\s*([^;{}]*)/g, m;
var hits = [];
while ((m = re.exec(noComments))) {
  var prop = m[1].trim(), val = m[2].trim();
  if (!/color|background|border|fill|stroke|shadow|outline/i.test(prop)) continue;
  // ignore token definitions themselves
  if (prop.indexOf('--') === 0) continue;
  if (/#[0-9a-fA-F]{3,8}/.test(val) || /\b(rgb|hsl)a?\(/.test(val) || /\b(aliceblue|white|black|red|green|blue|gray|grey)\b/i.test(val)) {
    hits.push(prop + ': ' + val);
  }
}
console.log('=== hard-coded colour values in hub.css: ' + hits.length + ' ===');
hits.forEach(function (h) { console.log('  ' + h.slice(0, 130)); });

// resolve what aliceblue is, and its contrast against --panel in both themes
var shell = fs.readFileSync('assets/shell.css', 'utf8');
function token(name, theme) {
  var scope = theme === 'dark' ? shell.slice(shell.indexOf('html[data-theme="dark"]')) : shell;
  var m = new RegExp('--' + name + '\\s*:\\s*([^;]+);').exec(scope);
  return m ? m[1].trim() : null;
}
['panel', 'card', 'bg', 'text'].forEach(function (t) {
  console.log('  --' + t + '  light=' + token(t, 'light') + '  dark=' + token(t, 'dark'));
});
