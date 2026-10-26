with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the malformed h3 at position ~50900
idx = content.find('<h3 <h3 id="ch1-webdir"')
if idx >= 0:
    # Replace the malformed portion
    old = content[idx:idx+80]
    new = '<h3 id="ch1-webdir" data-toc>1.5 webDir and the asset contract</h3>'
    content = content.replace(old, new, 1)  # only replace first occurrence
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed malformed h3')
else:
    print('Malformed h3 not found')