with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find ch1-stack section
idx = content.find('id="ch1-stack" data-toc')
if idx >= 0:
    # Print 600 chars from this position
    chunk = content[idx:idx+600]
    print('ch1-stack section (600 chars):')
    print(chunk)
    print()

# Find ch1-compare section
idx2 = content.find('id="ch1-compare" data-toc')
if idx2 >= 0:
    chunk2 = content[idx2:idx2+300]
    print('ch1-compare section (first 300 chars):')
    print(chunk2)