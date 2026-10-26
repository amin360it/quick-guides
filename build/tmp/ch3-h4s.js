'use strict';
/* ch3-h4s.js — add h4 sub-points to vue-nuxt-capacitor ch3 chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find the ch3 chapter section (2nd <section class="chapter">)
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch3 chapter is the 2nd one (index 1)
const ch3Section = sections[1];
if (!ch3Section) { console.log('Could not find ch3 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch3Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch3 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh3Content = ch3Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh3Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Content after </h3> up to the next h3 or end of chapter section
  const afterH3 = newCh3Content.slice(h3ClosePos + h3Close.length);
  // Find the position within the full file
  const afterH3GlobalPos = h3ClosePos + h3Close.length;
  const nextH3InChapterIndex = newCh3Content.indexOf('<h3', afterH3GlobalPos - ch3Section.index);
  const sectionEndInChapter = ch3Section.index + ch3Section.content.indexOf('</section>') + '</section>'.length;
  
  // Simpler: find next <h3> in the full file after this h3
  const fullNextH3 = s.indexOf('<h3 id=', afterH3GlobalPos);
  const fullSectionEnd = s.indexOf('</section>', ch3Section.index) + '</section>'.length;
  
  let contentAfter;
  if (fullNextH3 >= 0 && fullNextH3 < fullSectionEnd) {
    contentAfter = s.slice(afterH3GlobalPos, fullNextH3);
  } else {
    contentAfter = s.slice(afterH3GlobalPos, fullSectionEnd);
  }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    '<h4 id="ch2-1-' + (i+1) + '-init">Initialization Pattern</h4>',
    '<p>This section covers the standard pattern for initializing a Vue plugin within a Nuxt project. The initialization ensures that the plugin is properly registered and its APIs are available throughout the application lifecycle.</p>',
    '<h4 id="ch2-1-' + (i+1) + '-integration">Nuxt Integration</h4>',
    '<p>When using Nuxt, the plugin auto-registration via the nuxt.config.js plugins array handles the setup automatically. For manual registration, follow the pattern shown in the code sample.</p>'
  ].join('\n');
  
  // Replace the content after </h3> with h3 + h4s + original content
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh3Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh3Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh3Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh3Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch3 chapter content...');

// Replace the old ch3 section with the new one in the full file
// The ch3 chapter starts at sections[1].index and ends at sections[1].index + sections[1].content.indexOf('</section>') + '</section>'.length
const ch3Start = sections[1].index;
const ch3End = sections[1].index + sections[1].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh3Section = s.slice(ch3Start, ch3End);
const newCh3Section = '<section class="chapter">' + newCh3Content + '</section>';

const newS = s.replace(oldCh3Section, newCh3Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('vue-nuxt-capacitor.html', newS);
console.log('Done - ch3 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);