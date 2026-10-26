'use strict';
/* ch6-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch6 chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch6 chapter section (5th <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch6 chapter is the 5th one (index 4)
const ch6Section = sections[4];
if (!ch6Section) { console.log('Could not find ch6 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch6Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch6 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh6Content = ch6Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh6Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    '<h4 id="ch6-1-' + (i+1) + '-routing">Routing</h4>',
    '<p>This section covers the routing patterns in Nuxt applications. Nuxt provides file-based routing out of the box, and this section explains how to configure nested routes, dynamic routes, and route middleware.</p>',
    '<h4 id="ch6-1-' + (i+1) + '-state-management">State Management</h4>',
    '<p>This section covers state management patterns in Vue and Nuxt applications. From the Composition API provide inject to Pinia for global state, understanding these patterns is essential for building scalable applications.</p>'
  ].join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh6Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh6Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh6Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh6Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch6 chapter content...');

// Replace the old ch6 section with the new one
const ch6Start = sections[4].index;
const ch6End = sections[4].index + sections[4].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh6Section = s.slice(ch6Start, ch6End);
const newCh6Section = '<section class="chapter">' + newCh6Content + '</section>';

const newS = s.replace(oldCh6Section, newCh6Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch6 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);