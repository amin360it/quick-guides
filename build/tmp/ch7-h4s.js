'use strict';
/* ch7-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch7 chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch7 chapter section (6th <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch7 chapter is the 6th one (index 5)
const ch7Section = sections[5];
if (!ch7Section) { console.log('Could not find ch7 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch7Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch7 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh7Content = ch7Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh7Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Lines = [];
  h4Lines.push('<h4 id="ch7-1-' + (i+1) + '-composition">Composition API</h4>');
  h4Lines.push('<p>This section covers the Vue Composition API patterns within Nuxt applications</p>');
  h4Lines.push('<h4 id="ch7-1-' + (i+1) + '-teleport">Teleport</h4>');
  h4Lines.push('<p>This section covers the Teleport component in Vue</p>');
  const h4Content = h4Lines.join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh7Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh7Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh7Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh7Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch7 chapter content...');

// Replace the old ch7 section with the new one
const ch7Start = sections[5].index;
const ch7End = sections[5].index + sections[5].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh7Section = s.slice(ch7Start, ch7End);
const newCh7Section = '<section class="chapter">' + newCh7Content + '</section>';

const newS = s.replace(oldCh7Section, newCh7Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch7 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);