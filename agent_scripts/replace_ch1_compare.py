with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find ch1-compare section - old string from line 222 onwards
old = '''<h3 id="ch1-compare" data-toc>1.3 Capacitor vs Cordova vs React Native vs Flutter</h3>
    <p class="topic-desc">An honest comparison, including the cases where Capacitor is the wrong choice, so you do not spend a month on the wrong foundation.</p>
    <div class="codeWrap"><pre><code>                 Your UI is        Native code you
                 --------------    ------------------
Capacitor      web (HTML/CSS/JS) Kotlin / Swift, optional, on demand
Cordova        web (HTML/CSS/JS) Java / ObjC, plugin-based (largely legacy)
React Native   real native views  Kotlin / Swift, per component
Flu'''

new = '''<h3 id="ch1-compare" data-toc>1.3 Capacitor vs Cordova vs React Native vs Flutter</h3>
    <p class="topic-desc">An honest comparison, including the cases where Capacitor is the wrong choice, so you do not spend a month on the wrong foundation.</p>
    <h4 id="ch1-compare-native">Native UI components</h4>
    <p>Capacitor renders your application inside a native web view, but it does not recreate the entire native UI component library. Standard HTML elements — buttons, inputs, headings, divs — are rendered by the web view's engine and automatically adapt to the host platform's visual language through native theming and CSS system fonts. However, native-specific UI patterns — such as platform-styled modals, action sheets, segmented controls, or bottom navigation bars — must be explicitly built or provided by a plugin. Attempting to mimic native controls purely with CSS often results in a mismatch during OS updates, where the web view's rendering may not keep pace with the native toolkit's evolution.</p>
    <div class="codeWrap"><pre><code>// Example: platform-styled button using Capacitor's AppLauncher
// (For true native buttons, use the Action Sheet or Modal plugins)
import { Browser } from '@capacitor/browser';

async function openShareMenu() {
  // On iOS, this shows an action sheet; on Android, a context menu
  await Browser.open({
    url: 'https://example.com',
    presentationStyle: 'modal',
    toolbarColor: '#0b1020',
  });
}</code></pre></div>

    <h4 id="ch1-compare-bridge">Bridge overhead and performance</h4>
    <p>Every Capacitor API call crosses the JavaScript-native boundary via a serialized JSON payload. This serialisation — structured cloning — imposes a cost: primitive values pass through quickly, but objects and arrays require allocation and deserialisation on the receiving side. For high-frequency interactions (e.g. per-frame input, real-time sensor data), the bridge becomes a bottleneck. In these cases, consider direct native bridging, a WebAssembly module, or keeping the frequent logic entirely on the web side and using Capacitor only for the initial setup and occasional privileged operations.</p>
    <div class="codeWrap"><pre><code>// High-frequency call — avoid crossing the bridge in a loop
// Instead, expose a single native method that processes a batch of inputs

// Android (Kotlin): processes an array of sensor readings in one call
@PluginMethod
fun processReadings(call: PluginCall) {
    val readings = call.getFloatArray("readings") ?: emptyArray()
    val results = mutableListOf<Float>()
    for (r in readings) {
        results.add(nativeFilter(r))
    }
    call.resolve(mapOf("results" to results.toFloatArray()))
}

// iOS (Swift): same pattern
@objc func processReadings(_ call: CAPPluginCall) {
    guard let readings = call.array("readings") as? [Float] else {
        call.resolve(nil)
        return
    }
    var results = [Float]()
    for r in readings {
        results.append(nativeFilter(r))
    }
    call.resolve(["results": results])
}

// JavaScript wrapper
async function batchProcess(values: number[]): Promise<number[]> {
    const { results } = await Plugin.processBatch({ readings: values });
    return results;
}</code></pre></div>

    <h4 id="ch1-compare-ecosystem">Plugin ecosystem maturity</h4>
    <p>Capacitor's first-party plugin set covers the most common native needs — camera, geolocation, push notifications, splash screen, status bar, and file system. For anything beyond these, you will encounter a mix of community plugins, some of which are unmaintained or forked. Before committing to Capacitor for a feature, verify the plugin: has recent releases, supports the Capacitor version you are using, and works on both iOS and Android. If no plugin exists, the cost of writing a custom plugin (chapter 7) should be weighed against the benefits — for a one-off native interaction, dropping down to a native file in the platform project (chapter 8) may be simpler than publishing a full package.</p>
    <div class="codeWrap"><pre><code>// Verifying a plugin is right for your project
// Check the npm package metrics and Capacitor compatibility

// In package.json
{
  "dependencies": {
    "@capacitor/camera": "^^7.0.0",
    // Verify: npm view @capacitor/camera version
    // Check: npx cap doctor after install
  }
}

// Post-install verification
npx cap sync
npx cap doctor

# If the plugin is community-maintained, also check:
# - Open issues and pull request activity
# - TypeScript definitions included
# - Example usage in the repository</code></pre></div>
</section>

<h3 id="ch1-limits" data-toc>1.4 What Capacitor is genuinely bad at</h3>'''

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replacement successful for ch1-compare')
else:
    print('Old string NOT found for ch1-compare')