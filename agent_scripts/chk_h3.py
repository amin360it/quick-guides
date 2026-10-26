with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find('<h3 id="ch1-stack" data-toc>')
print('Found at index:', idx)
if idx >= 0:
    chunk = content[idx:idx+600]
    print('Repr of chunk:')
    print(repr(chunk))
    print()
    print('Normal string:')
    print(chunk)