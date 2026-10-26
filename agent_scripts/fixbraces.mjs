import fs from 'fs';

const SHELL = 'C:/Users/user/repo/learn-software-engineering/assets/shell.js';
let src = fs.readFileSync(SHELL, 'utf8');

function countBraces(s) {
  let open = 0, close = 0;
  let inString = false, stringChar = '';
  let inLineComment = false, inBlockComment = false;
  
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1] || '';
    
    if (inBlockComment) {
      if (c === '*' && next === '/') { inBlockComment = false; i++; continue; }
      continue;
    }
    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inString) {
      if (c === stringChar && s[i - 1] !== '\\') inString = false;
      continue;
    }
    
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (c === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
    if (c === '{') open++;
    if (c === '}') close++;
  }
  return { open, close };
}

const { open, close } = countBraces(src);
console.log('Braces: open=' + open + ', close=' + close + ', missing=' + (open - close));

if (open > close) {
  const missing = open - close;
  const fix = '\n' + '}\n'.repeat(missing) + '})();\n';
  src += fix;
  fs.writeFileSync(SHELL, src, 'utf8');
  console.log('Added ' + missing + ' closing braces + IIFE closure');
}