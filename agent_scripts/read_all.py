with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'rb') as f:
    content = f.read()
idx = content.find(b' id="ch1-stack" data-toc')
if idx >= 0:
    start = idx
    end = idx + 2000
    chunk = content[start:end]
    text = chunk.decode('utf-8', errors='replace')
    # Find the position of the next h3
    next_h3 = text.find(' id="ch1-compare"')
    if next_h3 >= 0:
        print('Next h3 at position:', next_h3)
        print('Text up to next h3 (first 300 chars):')
        print(repr(text[:next_h3+300]))
    else:
        print('No next h3 found in 2000 chars')
        # Try searching more broadly
        import re
        match = re.search(r'id="ch1-compare"', text)
        if match:
            print('Found ch1-compare at:', match.start())
    
    # Print the full text we have
    print('\\nFull text length:', len(text))
    print('\\nFull text:')
    print(text)