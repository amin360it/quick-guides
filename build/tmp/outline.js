// Print an indented skeleton of a hub page body: element + id/class only.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const file = process.argv[2] || 'index.html';
const s = fs.readFileSync(path.join(root, file), 'utf8');

const body = s.slice(s.indexOf('<body'));
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
let depth = 0;
const lines = [];
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
let m, lastText = '';
const norm = t => t.replace(/\s+/g, ' ').trim();

let cursor = 0;
while ((m = tagRe.exec(body))) {
  const text = norm(body.slice(cursor, m.index));
  if (text) lines.push('  '.repeat(depth) + '· ' + (text.length > 90 ? text.slice(0, 90) + '…' : text));
  cursor = tagRe.lastIndex;
  const [, close, rawName, attrs, selfClose] = m;
  const name = rawName.toLowerCase();
  if (VOID.has(name) || selfClose === '/') {
    const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
    const cl = (attrs.match(/\sclass="([^"]+)"/) || [])[1];
    if (id || cl) lines.push('  '.repeat(depth) + '<' + name + (id ? ' #' + id : '') + (cl ? ' .' + cl.replace(/\s+/g, '.') : '') + '>');
    continue;
  }
  if (close) { depth = Math.max(0, depth - 1); continue; }
  const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
  const cl = (attrs.match(/\sclass="([^"]+)"/) || [])[1];
  lines.push('  '.repeat(depth) + '<' + name + (id ? ' #' + id : '') + (cl ? ' .' + cl.replace(/\s+/g, '.') : '') + '>');
  depth++;
}
console.log(lines.join('\n'));
