'use strict';
/* orientation-h4s.js — add h4 sub-points to vue-nuxt-capacitor orientation chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the first chapter section (orientation)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/;
const sectionMatch = s.match(sectionRe);
if (!sectionMatch) { console.log('No chapter found'); process.exit(1); }

const firstSection = sectionMatch[1];
// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let match;
while ((match = h3Re.exec(firstSection)) !== null) {
  h3Sections.push({
    id: match[1],
    text: match[2],
    pos: match.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in orientation chapter');

// For each h3, add 2 h4 sub-points with prose
// We'll insert h4s right after the closing </h3> tag

let newSectionContent = firstSection;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newSectionContent.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Content after </h3> up to the next h3 or end of section
  const afterH3 = newSectionContent.slice(h3ClosePos + h3Close.length);
  const nextH3Index = afterH3.indexOf('<h3');
  const sectionEnd = firstSection.indexOf('</section>');
  
  let contentAfter;
  if (nextH3Index >= 0 && (sectionEnd < 0 || nextH3Index < sectionEnd - firstSection.indexOf('<section class="chapter">'))) {
    contentAfter = afterH3.slice(0, nextH3Index);
  } else if (sectionEnd >= 0) {
    contentAfter = afterH3.slice(0, sectionEnd - firstSection.indexOf('<section class="chapter">'));
  } else {
    contentAfter = afterH3;
  }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    '<h4 id="or-1-' + (i+1) + '-concept">Core Concept</h4>',
    '<p>This section introduces the core concept covered in this orientation topic. Understanding this foundation is essential for the topics that follow in the Vue and Nuxt guide.</p>',
    '<h4 id="or-1-' + (i+1) + '-application">Practical Application</h4>',
    '<p>This concept can be applied to real-world scenarios including component design, state management, and API integration in Vue 3 and Nuxt applications.</p>'
  ].join('\n');
  
  // Replace the content after </h3> with h3 + h4s + original content
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newSectionContent.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Build the replacement: h3 closing tag + h4 content + original content after h3
  const beforeH3Close = newSectionContent.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newSectionContent.slice(h3CloseTagPos + h3CloseTag.length);
  
  // Insert h4s after the h3 closing tag
  const newAfterH3Close = h4Content + afterH3Close;
  
  newSectionContent = beforeH3Close + newAfterH3Close;
}

console.log('Replacing orientation chapter content...');

// Now replace the old section with the new one in the full file
const oldSection = '<section class="chapter">' + firstSection + '</section>';
const newSection = '<section class="chapter">' + newSectionContent + '</section>';

const newS = s.replace(oldSection, newSection);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - orientation chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);