const fs = require('fs');
let s = fs.readFileSync('domains-hosting.html', 'utf8');

// Find the fifth chapter section
const sectionRe = /<section class="chapter">([\s\S]*?)<\/section>/g;
const sections = [];
let match;
while ((match = sectionRe.exec(s)) !== null) {
  sections.push({ content: match[1], index: match.index });
}

// The ch5 chapter is the 5th one (index 4)
const ch5Section = sections[4];
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
    `<h4 id="dh-5-${i+1}-model">Value Model</h4>`,
    `<p>This section covers the value model of domain names, including how domain names contribute to brand value, business identity, and the economic factors that influence domain name pricing and investment.</p>`,
    `<h4 id="dh-5-${i+1}-ttl-value">TTL Value</h4>`,
    `<p>This section covers the Time-to-Live (TTL) values in DNS records, including how TTL affects caching, resolution speed, and the trade-offs between quick resolution and propagation delays.</p>`
  ].join('\n');
  
  // Replace the content after </h3>
  const h3CloseTag = '</h3>';
  const h3CloseTagPos = newCh5Content.indexOf(h3CloseTag, h3.pos);
  
  if (h3ClosePos < 0) { console.log('Could not find </h3> for h3', i+1); continue; }
  
  const beforeH3Close = newCh5Content.slice(0, h3CloseTagPos + h3CloseTag.length);
  const afterH3Close = newCh5Content.slice(h3CloseTagPos + h3CloseTag.length);
  const newAfterH3Close = h4Content + afterH3Close;
  
  newCh5Content = beforeH3Close + newAfterH3Close;
}

console.log('Replacing ch5 chapter content...');

// Replace the old ch5 section with the new one
const ch5Start = sections[4].index;
const ch5End = sections[4].index + sections[4].content.lastIndexOf('</section>') + '</section>'.length;
const oldCh5Section = s.slice(ch5Start, ch5End);
const newCh5Section = '<section class="chapter">' + newCh5Content + '</section>';

const newS = s.replace(oldCh5Section, newCh5Section);

if (newS === s) { console.log('No replacement made - strings not matching'); process.exit(1); }

fs.writeFileSync('domains-hosting.html', newS);
console.log('Done - ch5 chapter updated');
console.log('New h4 count:', (newS.match(/<h4 id=/g) || []).length);