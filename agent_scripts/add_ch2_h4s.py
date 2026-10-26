with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the ch2-init h3 and add h4s after the topic-desc paragraph
# The structure is: h3, p.topic-desc, div.codeWrap, warn, p (about app id)
# We need to add h4s between the warn div and the "app id" paragraph

old = '''<div class="warn"><p>Step 3 is not optional. <code>npx cap add</code> copies your <code>webDir</code> into the native project immediately; if the folder is empty you get a native app that launches to nothing, and the error appears nowhere.</p></div>
    <p>The app id you pass to <code>cap init</code> becomes the package name on Android and the bundle identifier on iOS.'''

new = '''<div class="warn"><p>Step 3 is not optional. <code>npx cap add</code> copies your <code>webDir</code> into the native project immediately; if the folder is empty you get a native app that launches to nothing, and the error appears nowhere.</p></div>

    <h4 id="ch2-init-vite">Vite project scaffolding</h4>
    <p>Start by creating a new Vite project using the <code>npm create vite@latest</code> command. The template should be vanilla, vanilla, or a framework of your choice — this guide uses vanilla JavaScript because it keeps the focus on Capacitor concepts without framework abstractions. The command <code>npm create vite@latest my-app -- --template vanilla</code> scaffolds a folder with the config files, a basic HTML page, and an empty <code>src/</code> directory. After running this, <code>cd my-app</code> into the new directory.</p>
    <div class="codeWrap"><pre><code># scaffold a new Vite project
npm create vite@latest my-app -- --template vanilla

# change into the project folder
cd my-app

# install the base dependencies
npm install</code></pre></div>

    <h4 id="ch2-init-capacitor">Capacitor CLI installation</h4>
    <p>Next, install the Capacitor core runtime and the CLI development tools. The core package (@capacitor/core) provides the JavaScript APIs and bridge, while the CLI (@capacitor/cli) provides the <code>npx cap</code> commands for adding platforms, syncing assets, and opening native projects. Install both as dev dependencies so the native project can access the correct versions.</p>
    <div class="codeWrap"><pre><code># install Capacitor packages
npm install @capacitor/core
npm install -D @capacitor/cli

# initialise Capacitor with your app identity
npx cap init

#   app id     -> com.yourcompany.myapp   (reverse domain, permanent)
#   app name   -> My App                 (the label under the icon)
#   web dir    -> dist</code></pre></div>

    <h4 id="ch2-init-build">Build once before adding platforms</h4>
    <p>The most common first-run failure is running <code>npx cap add android</code> before the first build. Capacitor copies your <code>webDir</code> into the native project immediately; if the folder is empty, the native app launches to a blank screen. Always run <code>npm run build</code> (or <code>vite build</code>) first so that <code>./dist</code> exists with your compiled assets. Only after the build succeeds should you add the platforms.</p>
    <div class="codeWrap"><pre><code># always build first
npm run build          # emits ./dist

# then add platforms
npx cap add android
npx cap add ios        # macOS only

# and sync for the first time
npx cap sync</code></pre></div>

    <h4 id="ch2-init-verify">Verify the initialization</h4>
    <p>After the above steps, verify that the initialization succeeded by checking the Capacitor version and confirming the platforms are listed. Run <code>npx cap ls</code> to list installed plugins and platforms, and <code>npx cap doctor</code> to check the environment for common problems. If <code>npx cap doctor</code> reports issues, resolve them before proceeding.</p>
    <div class="codeWrap"><pre><code># verify the setup
npx cap ls                     # list platforms and plugins
npx cap doctor                 # check for environment problems

# example output
# Type  Name
# ----  ---------------------------
# cordova  capacitor-launchnav
# cordova  capacitor-screen-orientation
# android  android

# if doctor reports nothing, you are ready to proceed</code></pre></div>'''

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replacement successful for ch2-init h4s')
else:
    print('Old string NOT found for ch2-init h4s')
    # Debug
    idx = content.find('Step 3 is not optional')
    if idx >= 0:
        print('Found Step 3 at', idx)
        print(content[idx:idx+100])
    else:
        print('Step 3 not found')