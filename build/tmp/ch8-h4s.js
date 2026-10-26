'use strict';
/* ch8-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch8 (appendix) chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch8 chapter section (7th <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch8 chapter is the 7th one (index 6)
const ch8Section = sections[6];
if (!ch8Section) { console.log('Could not find ch8 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch8Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch8 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh8Content = ch8Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh8Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Lines = [];
  h4Lines.push('<h4 id="app-1-' + (i+1) -'accessibility">Accessibility</h4>');
  h4Lines.push('<p>This section covers accessibility patterns for Vue and Nuxt applications, ensuring that applications are usable by people with disabilities.</p>');
  h4Lines.push('<h4 id="app-1-' + (i+1) + '-performance">Performance</h4>');
  h4Lines.push('<p>This section covers performance optimization techniques for Vue and Nuxt applications, including code splitting, lazy loading, and rendering performance.</p>');
  const h4Content = h4Lines.join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh8Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh8Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh8Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh8Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch8 chapter content...');

// Replace the old ch8 section with the new one
const ch8Start = sections[6].index;
const ch8End = sections[6].index + sections[6].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh8Section = s.slice(ch8Start, ch8End);
const newCh8Section = '<section class="chapter">' + newCh8Content + '</section>';

const newS = s.replace(oldCh8Section, newCh8Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch8 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);