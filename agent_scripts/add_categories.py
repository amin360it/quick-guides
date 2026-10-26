#!/usr/bin/env python3
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Category groups data
categories = [
    ('web-basics', 'Web Basics', 8, 'index.html#cat-web-basics'),
    ('foundations', 'Foundations', 4, 'index.html#cat-foundations'),
    ('languages', 'Languages', 21, 'index.html#cat-languages'),
    ('frontend', 'Frontend', 20, 'index.html#cat-frontend'),
    ('frameworks', 'Frameworks', 24, 'index.html#cat-frameworks'),
    ('mobile', 'Mobile & Cross-Platform', 6, 'index.html#cat-mobile'),
    ('architecture', 'Architecture & Design', 3, 'index.html#cat-architecture'),
    ('data', 'Data & Delivery', 12, 'index.html#cat-data'),
    ('devops', 'DevOps & Hosting', 12, 'index.html#cat-devops'),
    ('wordpress', 'WordPress', 3, 'index.html#cat-wordpress'),
    ('ai', 'AI & ML', 1, 'index.html#cat-ai'),
]

# Build the topnav group HTML
tn_group_html = '<div class="tn-group" id="tn-group-categories">'
tn_group_html += '<div class="tn-cat-h">Guides</div>'
for key, label, count, url in categories:
    active = ' curr' if key == 'web-basics' else ''
    tn_group_html += f'<a class="tn-link{active}" href="{url}">{label} <span class="cat-count">({count})</span></a>'
tn_group_html += '</div>'

# Find the topnav and replace its content
# The topnav appears as: <nav id="topnav" class="topnav" aria-label="Main"></nav>
old_topnav = '<nav id="topnav" class="topnav" aria-label="Main"></nav>'
new_topnav = '<nav id="topnav" class="topnav" aria-label="Main">' + tn_group_html + '</nav>'

new_content = content.replace(old_topnav, new_topnav)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("index.html updated with category groups in topnav")