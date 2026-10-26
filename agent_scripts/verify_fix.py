with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for ch1-stack
idx = content.find('id="ch1-stack" data-toc')
if idx >= 0:
    print('ch1-stack found at position', idx)
    print('Context:', repr(content[idx:idx+150]))
else:
    print('ch1-stack NOT found')

# Check for ch1-compare
idx2 = content.find('id="ch1-compare" data-toc')
if idx2 >= 0:
    print('ch1-compare found at position', idx2)
    print('Context:', repr(content[idx2:idx2+100]))
else:
    print('ch1-compare NOT found')