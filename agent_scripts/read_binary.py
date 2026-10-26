with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'rb') as f:
    content = f.read()
idx = content.find(b' id="ch1-stack" data-toc')
if idx >= 0:
    start = idx
    end = idx + 500
    chunk = content[start:end]
    text = chunk.decode('utf-8', errors='replace')
    print('Text slice:', repr(text[:200]))
else:
    print('h3 ch1-stack not found in binary')