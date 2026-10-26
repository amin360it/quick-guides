'use strict';
/* orientation-fix.js — add h4 sub-points to vue-nuxt-capacitor orientation chapter */
const fs = require('fs');
let s = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// Find and replace the orientation chapter's h3 sections
// The orientation chapter has 3 h3 sections, each needs 2-4 h4 sub-points

// First h3: ch1-1 (or similar) - orientation first section
// Let's find the orientation h3 sections and add h4s

// We need to add h4 elements under each h3 in the orientation chapter
// The orientation chapter is the first <section class="chapter">

// Let's approach this differently - use the edit tool to add h4 sub-points
// to each h3 in the orientation chapter

// Read the file
const content = fs.readFileSync('vue-nuxt-capacitor.html', 'utf8');

// We'll add h4 sub-points to each h3 in the orientation chapter
// The orientation chapter has h3 sections with text like "▸ " prefix

// Let's find and replace each h3 section's content to add h4 sub-points

// Actually, let me take a different approach - use the existing pattern from other chapters
// and add h4s under each h3

// For orientation, the h3 sections likely have simple text. Let me add h4 sub-points.

// I'll use surgical edits to add h4 elements under each h3

// The pattern from other chapters is:
// <h3 id="chN-M" data-toc>N.M Topic</h3>
// <p class="topic-desc">...</p>
// <h4 id="chN-M-shorttopic">Sub-point</h4>
// <p>...</p>
// <div class="codeWrap"><pre><code>...</code></pre></div>

// For orientation, we may not have code blocks, but we add h4 sub-points with prose

// Let me add h4 sub-points to each of the 3 h3 sections in orientation

// First, let me find the exact h3 sections in orientation

// I'll use a simpler approach: add h4 elements after each h3 in the orientation chapter

// The orientation chapter is the first <section> element

// Let's find the first <section class="chapter"> and work within it

const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/;
const match = content.match(sectionRe);
if (!match) { console.log('No chapter found'); process.exit(1); }

const firstSection = match[1];
// Now find the h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
let h3Match;
const h3Sections = [];
let tempContent = firstSection;
while ((h3Match = h3Re.exec(tempContent)) !== null) {
  h3Sections.push({
    id: h3Match[1],
    position: h3Match.index,
    text: h3Match[2]
  });
}

// Now add h4 sub-points under each h3
// We'll replace the content after each h3 closing tag with h3 + h4s

let newSectionContent = firstSection;
let offset = 0;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  // Find the content after this h3 closing tag up to the next h3 or end of section
  const afterH3 = newSectionContent.slice(h3.position + h3.id.length + 15); // +15 for '</h3>'
  // Find the next h3 or end of section
  const nextH3Index = newSectionContent.indexOf('<h3', h3.position + h3.id.length + 15);
  const sectionEnd = newSectionContent.indexOf('</section>');
  
  let contentAfter;
  if (nextH3Index >= 0 && (sectionEnd < 0 || nextH3Index < sectionEnd)) {
    contentAfter = newSectionContent.slice(h3.position + h3.id.length + 15, nextH3Index);
  } else if (sectionEnd >= 0) {
    contentAfter = newSectionContent.slice(h3.position + h3.id.length + 15, sectionEnd);
  } else {
    contentAfter = newSectionContent.slice(h3.position + h3.id.length + 15);
  }
  
  // Add h4 sub-points under this h3
  // Pattern: add 2 h4 sub-points with prose
  const h4s = [
    '<h4 id="or-1-' + (i+1) + '-concept">Core Concept</h4>',
    '<p>This section introduces the core concept covered in this topic. Understanding this foundation is essential for the topics that follow.</p>',
    '<h4 id="or-1-' + (i+1) -'+ 'application">Practical Application</h4>',
    '<p>This concept can be applied to real-world scenarios in Vue and Nuxt development, including component design, state management, and API integration.</p>'
  ];
  
  // Replace the content after h3 with h3 + h4s + original content
  const h3Close = '</h3>';
  const h3ClosePos = newSectionContent.indexOf(h3Close, h3.position);
  
  const newContent = newSectionContent.slice(0, h3ClosePos + h3Close.length) +
    h4s[0] + h4s[1] +
    newSectionContent.slice(h3ClosePos + h3Close.length);
  
  newSectionContent = newSectionContent.replace(
    newSectionContent.slice(0, h3ClosePos + h3Close.length) + 
    newSectionContent.slice(h3ClosePos + h3Close.length).split(h4s[0])[0],
    newContent
  );
}

// This is getting complex. Let me try a completely different approach.
// Let me just write the whole new orientation chapter content.

// Actually, let me step back and use a much simpler approach:
// I'll just add h4 elements as placeholders under each h3 in the orientation chapter.
// The exact prose can be refined later.

// Let me find all h3 in the orientation chapter and add h4 placeholders

console.log('Found', h3Sections.length, 'h3 sections in orientation chapter');
for (let i = 0; i < h3Sections.length; i++) {
  console.log('h3', i+1, 'id:', h3Sections[i].id);
}

// Since the approach is getting too complex with string manipulation,
// let me use a different strategy: write a new section content using the write tool
// after examining the exact current content.

console.log('Strategy: will use surgical edit approach instead');