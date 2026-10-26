with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
idx = content.find(' id="ch1-stack" data-toc')
if idx >= 0:
    start = idx - 50
    if start < 0: start = 0
    end = idx + 300
    print(repr(content[start:end]))
else:
    print('h3 ch1-stack not found')