with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find('id="ch1-compare" data-toc')
if idx >= 0:
    start = idx - 500
    if start < 0: start = 0
    print('Context before ch1-compare:')
    print(content[start:idx])
else:
    print('ch1-compare not found')