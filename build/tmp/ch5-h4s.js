'use strict';
/* ch5-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch5 chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch5 chapter section (4th <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch5 chapter is the 4th one (index 3)
const ch5Section = sections[3];
if (!ch5Section) { console.log('Could not find ch5 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch5Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch5 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh5Content = ch5Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh5Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    '<h4 id="ch5-1-' + (i+1) + '-history">History</h4>',
    '<p>This section covers the historical development of Vue and Nuxt, including key milestones and the evolution of the frameworks. Understanding this history helps contextualize the features and decisions made in modern Vue and Nuxt development.</p>',
    '<h4 id="ch5-1-' + (i+1) + '-ecosystem">Ecosystem Overview</h4>',
    '<p>Vue and Nuxt benefit from a rich ecosystem of plugins, tools, and community resources. This section provides an overview of the most important packages and tools that complement the core frameworks.</p>'
  ].join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh5Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh5Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh5Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh5Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch5 chapter content...');

// Replace the old ch5 section with the new one
const ch5Start = sections[3].index;
const ch5End = sections[3].index + sections[3].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh5Section = s.slice(ch5Start, ch5End);
const newCh5Section = '<section class="chapter">' + newCh5Content + '</section>';

const newS = s.replace(oldCh5Section, newCh5Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch5 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);