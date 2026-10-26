with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()
import re
h3s = re.findall(r'<h3[^>]*id="ch1-webdir"[^>]*>', content)
print('h3 ch1-webdir count:', len(h3s))
for h in h3s:
    print('  ', h)