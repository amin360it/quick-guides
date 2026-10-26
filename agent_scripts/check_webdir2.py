with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('id="ch1-webdir" data-toc>')
if idx >= 0:
    print('ch1-webdir section (500 chars):')
    print(content[idx:idx+500])
else:
    print('ch1-webdir NOT found')