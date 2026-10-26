with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find('id="ch2-init" data-toc>')
if idx >= 0:
    print(content[idx:idx+1500])
else:
    print('ch2-init NOT found')