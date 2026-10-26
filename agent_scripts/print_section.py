with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Print lines 210-222 (ch1-stack section end)
for i in range(209, 222):
    print(f'Line {i+1}: {repr(lines[i])}')