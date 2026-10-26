with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find('id="ch2-config" data-toc>')
if idx >= 0:
    print('ch2-config found at', idx)
    print(content[idx:idx+300])
else:
    print('ch2-config NOT found')