with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the ch2-config section and add h4s after the code blocks
# The section has: h3, p.topic-desc, code block (config example), p (about androidScheme/Keyboard.resize),
# then two code blocks (Keyboard.resize and server.url), then note

# I'll add h4s after the config code block and the androidScheme/Keyboard.resize explanation

old = '''// Two of those deserve emphasis. <code>androidScheme: 'https'</code> makes your local origin <code>https://localhost</code> instead of the default <code>http://localhost</code>, which means relative URLs, <code>fetch()</code> and service workers behave exactly as they do in production. And <code>Keyboard.resize</code> decides what happens when the soft keyboard opens - setting it to <code>'native'</code> avoids the common bug where a fixed-position footer jumps above the keyboard.'''

new = '''<h4 id="ch2-config-androidscheme">Android cleartext scheme</h4>
    <p><code>androidScheme: 'https'</code> configures the Dev Server URL scheme. By default, Capacitor uses <code>http://localhost</code> for the dev server, but this causes mixed-content issues on Android 9+ when your app makes HTTPS requests. Setting this to <code>'https'</code> forces the dev server to use <code>https://localhost</code>, aligning development with production behaviour. Remember to also set <code>cleartext: true</code> in the <code>server</code> section if you keep <code>http</code> as the scheme.</p>
    <div class="codeWrap"><pre><code>// capacitor.config.ts - enable https for dev server
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acme.app',
  appName: 'Field Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',     // use https://localhost
    url: 'http://192.168.1.50:5173',
    cleartext: true,           // only needed if using http://
  },
};

export default config;</code></pre></div>

    <h4 id="ch2-config-keyboardresize">Keyboard resize behavior</h4>
    <p>The <code>Keyboard.resize</code> option controls what happens when the soft keyboard opens on a mobile device. Setting it to <code>'body'</code> makes the entire body element scroll to accommodate the keyboard, which is the most common behavior. Setting it to <code>'native'</code> uses the platform's native keyboard handling, which preserves fixed-position elements (such as bottom navigation bars or footers) in place and scrolls only the content area. Setting it to <code>'none'</code> disables keyboard adjustment entirely, which you would only do if you are managing layout manually with your own scroll logic or <code>--kb</code> CSS variables.</p>
    <div class="codeWrap"><pre><code>// capacitor.config.ts - keyboard resize options
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acme.app',
  appName: 'Field Notes',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'body',           // 'body' | 'native' | 'none'
      resizeOnFullScreen: true,
    },
  },
};

export default config;</code></pre></div>';

# And the rest of the config key reference remains unchanged'''

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replacement successful for ch2-config h4s')
else:
    print('Old string NOT found for ch2-config h4s')
    # Debug
    idx = content.find('androidScheme:')
    if idx >= 0:
        print('Found androidScheme at', idx)
        print(content[idx:idx+100])
    else:
        print('androidScheme not found')