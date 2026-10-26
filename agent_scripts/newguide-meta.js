const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const files = [
  'nodejs.html', 'bun.html', 'docker-compose.html', 'fontawesome-icons.html',
  'java.html', 'n8n.html', 'chatgpt.html', 'midjourney.html', 'claude.html',
];
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const title = (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  const band = s.match(/<h1 class="am-band">([\s\S]*?)<\/h1>/);
  const bandT = band ? (band[1].match(/am-band-t">([^<]*)/)||[])[1] || '' : '';
  const bandS = band ? (band[1].match(/am-band-s">([^<]*)/)||[])[1] || '' : '';
  const h2 = (s.match(/<h2[ >]/g) || []).length;
  const h3 = (s.match(/<h3[ >]/g) || []).length;
  const h4 = (s.match(/<h4[ >]/g) || []).length;
  const code = (s.match(/class="codeWrap"/g) || []).length;
  const pre = (s.match(/<pre>/g) || []).length;
  const size = Buffer.byteLength(s);
  console.log('=== ' + f + ' (' + (size/1024).toFixed(0) + ' KB) ===');
  console.log('  <title>: ' + JSON.stringify(title));
  console.log('  band-t : ' + JSON.stringify(bandT));
  console.log('  band-s : ' + JSON.stringify(bandS));
  console.log('  h2=' + h2 + ' h3=' + h3 + ' h4=' + h4 + ' codeWrap=' + code + ' pre=' + pre);
}
