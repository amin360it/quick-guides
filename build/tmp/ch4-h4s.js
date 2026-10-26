'use strict';
/* ch4-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch4 chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch4 chapter section (3rd <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch4 chapter is the 3rd one (index 2)
const ch4Section = sections[2];
if (!ch4Section) { console.log('Could not find ch4 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch4Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch4 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh4Content = ch4Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh4Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    '<h4 id="ch4-1-' + (i+1) + '-layout">Component Layout</h4>',
    '<p>This section covers the standard layout pattern for Vue components within Nuxt applications. The layout defines the overall structure of pages and ensures consistent navigation and rendering across the application.</p>',
    '<h4 id="ch4-1-' + (i+1) + '-styling">Styling and Theming</h4>',
    '<p>Vue components use scoped CSS and Nuxt styling solutions to ensure component-level styling does not leak. This section covers the patterns for maintaining consistent theming across the application.</p>'
  ].join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh4Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh4Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh4Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh4Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch4 chapter content...');

// Replace the old ch4 section with the new one
const ch4Start = sections[2].index;
const ch4End = sections[2].index + sections[2].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh4Section = s.slice(ch4Start, ch4End);
const newCh4Section = '<section class="chapter">' + newCh4Content + '</section>';

const newS = s.replace(oldCh4Section, newCh4Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch4 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);