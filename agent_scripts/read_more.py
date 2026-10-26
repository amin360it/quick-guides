with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'rb') as f:
    content = f.read()
idx = content.find(b' id="ch1-stack" data-toc')
if idx >= 0:
    start = idx
    end = idx + 1000
    chunk = content[start:end]
    text = chunk.decode('utf-8', errors='replace')
    # Find the position of the next h3
    next_h3 = text.find(' id="ch1-compare"')
    if next_h3 >= 0:
        print('Next h3 at position:', next_h3)
        print('Text up to next h3:')
        print(repr(text[:next_h3+50]))
    else:
        print('No next h3 found')
    # Also print chars around the warn div
    warn_pos = text.find('class="warn"')
    if warn_pos >= 0:
        print('Warn div at position:', warn_pos)
        print('Warn div content:', repr(text[warn_pos:warn_pos+200]))