with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line with ch1-stack h3
for i, line in enumerate(lines):
    if 'ch1-stack' in line and 'data-toc' in line:
        print(f'Line {i+1}: {repr(line)}')
        # Print next 5 lines
        for j in range(i+1, min(i+6, len(lines))):
            print(f'Line {j+1}: {repr(lines[j])}')
        break