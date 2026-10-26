const fs = require('fs');
let s = fs.readFileSync('domains-hosting.html', 'utf8');

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

console.log('Found', h3Sections.length, 'h3 sections in ch1 chapter');

// For each h3, add 2 h4 sub-points with prose
let newSectionContent = firstSection;

for (let i = 0; i < h3Sections.length; i++) {
  const h3 = h3Sections[i];
  const h3Close = '</h3>';
  const h3ClosePos = newSectionContent.indexOf(h3Close, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Lines = [];
  h4Lines.push('<h4 id="dh-1-' + (i+1) + '-intro">Introduction</h4>');
  h4Lines.push('<p>This section provides an overview of the domain and hosting landscape, covering the fundamental concepts and decision-making framework.</p>');
  h4Lines.push('<h4 id="dh-1-' + (i+1) + '-deployment">Deployment Models</h4>');
  h4Lines.push('<p>This section covers the various approaches to deploying digital services, from traditional hosting to modern cloud platforms, and the trade-offs involved.</p>');
  const h4Content = h4Lines.join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newSectionContent.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newSectionContent.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newSectionContent.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newSectionContent = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch1 chapter content...');

// Replace the old section with the new one in the full file
const oldSection = '<section class="chapter">' + firstSection + '</section>';
const newSection = '<section class="chapter">' + newSectionContent + '</section>';

const newS = s.replace(oldSection, newSection);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('domains-hosting.html', newS);
console.log('Done - ch1 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);