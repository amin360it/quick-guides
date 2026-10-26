with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('id="ch1-webdir" data-toc')
if idx >= 0:
    # Print 600 chars from this position
    chunk = content[idx:idx+600]
    print('ch1-webdir section (600 chars):')
    print(chunk)