// Find SVG shape elements that have no <svg> ancestor (they render as nothing).
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const SHAPES = new Set(['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'g', 'use', 'defs', 'text', 'mask', 'clippath']);
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));

for (const file of ['index.html', 'topics.html']) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  const body = s.slice(s.indexOf('<body'));
  const stack = [];
  const faults = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(body))) {
    const [, close, rawName, , selfClose] = m;
    const name = rawName.toLowerCase();
    if (close) {
      // pop to matching name
      let k = stack.length - 1;
      while (k >= 0 && stack[k] !== name) k--;
      if (k >= 0) stack.length = k;
      continue;
    }
    if (VOID.has(name) || selfClose === '/') {
      if (SHAPES.has(name) && !stack.includes('svg'))
        faults.push({ name, line: body.slice(0, m.index).split('\n').length, stack: stack.slice(-4).join('>') });
      continue;
    }
    if (SHAPES.has(name) && !stack.includes('svg'))
      faults.push({ name, line: body.slice(0, m.index).split('\n').length, stack: stack.slice(-4).join('>') });
    stack.push(name);
  }
  console.log(file, '| shape elements with no <svg> ancestor:', faults.length);
  faults.forEach(f => console.log('   line', f.line, '<' + f.name + '>  inside', f.stack || '(root)'));
}
