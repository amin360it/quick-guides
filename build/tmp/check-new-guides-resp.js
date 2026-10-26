const fs = require('fs');
const files = ['nodejs.html', 'bun.html', 'docker-compose.html', 'fontawesome-icons.html'];
files.forEach(f => {
  const s = fs.readFileSync(f, 'utf8');
  console.log(f + ': burger=' + s.includes('id="burger"') + ' topnav=' + s.includes('id="topnav"') + ' modeBtn=' + s.includes('id="modeBtn"') + ' modePop=' + s.includes('id="modePop"') + ' mode-wrap=' + s.includes('class="mode-wrap"') + ' am-band=' + s.includes('am-band') + ' sidebar=' + s.includes('id="sidebar"'));
});