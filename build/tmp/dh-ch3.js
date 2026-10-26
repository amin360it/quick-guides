const fs = require('fs');
let s = fs.readFileSync('domains-hosting.html', 'utf8');

// Find the third chapter section
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch3 chapter is the 3rd one (index 2)
const ch3Section = sections[2];
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
  
  // Add 2 h4 sub-points with prose under this h3
  const h4Content = [
    `<h4 id="dh-3-${i+1}-anatomy">Anatomy</h4>`,
    `<p>This section covers the structural anatomy of domain name systems, including the relationship between domain names, IP addresses, and the various components that make up the naming infrastructure.</p>`,
    `<h4 id="dh-3-${i+1}-records">DNS Records</h4>`,
    `<p>This section explores the various DNS record types (A, AAAA, CNAME, MX, TXT, etc.) and their roles in domain resolution and email routing.</p>`
  ].join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh3Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3CloseTagPos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh3Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh3Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh3Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch3 chapter content...');

// Replace the old ch3 section with the new one
const ch3Start = sections[2].index;
const ch3End = sections[2].index + sections[2].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh3Section = s.slice(ch3Start, ch3End);
const newCh3Section = '<section class="chapter">' + newCh3Content + '</section>';

const newS = s.replace(oldCh3Section, newCh3Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('domains-hosting.html', newS);
console.log('Done - ch3 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);