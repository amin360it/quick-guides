const fs = require('fs');
let s = fs.readFileSync('domains-hosting.html', 'utf8');

// Find the second chapter section
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch2 chapter is the 2nd one (index 1)
const ch2Section = sections[1];
if (!ch2Section) { console.log('Could not find ch2 chapter'); process.exit(1); }

// Find all h3 sections within it
const h3Re = /<h3 id="([^"]+)"[^>]*data-toc>([\s\S]*?)<\/h3>/g;
const h3Sections = [];
let m;
while ((m = h3Re.exec(ch2Section.content)) !== null) {
  h3Sections.push({
    id: m[1],
    text: m[2],
    pos: m.index
  });
}

console.log('Found', h3Sections.length, 'h3 sections in ch2 chapter');

// For each h3, add 2 h4 sub-points with prose
let newCh2Content = ch2Section.content;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newCh2Content.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Lines = [];
  h4Lines.push('<h4 id="dh-2-' + (i+1) + '-labels">Labeling Scheme</h4>');
  h4Lines.push('<p>This section covers the system of labels used in domain naming, including best practices for creating memorable and effective domain names that are easy to remember and spell.</p>');
  h4Lines.push('<h4 id="dh-2-' + (i+1) + '-structure">Domain Structure</h4>');
  h4Lines.push('<p>This section explores the hierarchical structure of domain names, including second-level domains, top-level domains, and the organizational logic behind domain naming conventions.</p>');
  const h4Content = h4Lines.join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh2Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh2Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh2Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh2Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch2 chapter content...');

// Replace the old ch2 section with the new one
const ch2Start = sections[1].index;
const ch2End = sections[1].index + sections[1].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh2Section = s.slice(ch2Start, ch2End);
const newCh2Section = '<section class="chapter">' + newCh2Content + '</section>';

const newS = s.replace(oldCh2Section, newCh2Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('domains-hosting.html', newS);
console.log('Done - ch2 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);