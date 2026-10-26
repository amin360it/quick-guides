with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = 50900
print('Exact chars around h3:')
for i in range(idx, min(idx+100, len(content))):
    c = content[i]
    print(f'{i}: {repr(c)}') if not c.isprintable() else None
print()
# Print the visible chars
print('Visible:', content[idx:idx+100])