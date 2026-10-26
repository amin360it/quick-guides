with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all h3 occurrences
import re
h3s = [(m.start(), m.group()) for m in re.finditer(r'<h3[^>]+>', content)]
print('All h3 tags:')
for start, tag in h3s:
    print(f'  Position {start}: {tag}')

# Also find id="ch1-webdir" occurrences
idx = 0
while True:
    idx = content.find('id="ch1-webdir"', idx)
    if idx == -1:
        break
    print(f'id="ch1-webdir" at position {idx}')
    idx += 1