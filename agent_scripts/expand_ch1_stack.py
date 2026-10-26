import re

with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ch1-stack section
old = '''<h3 id="ch1-stack" data-toc>1.2 The layers from URL bar to JavaScript</h3>
    <p class="topic-desc">Walks the call path from your button click down to an OS API and back, so error messages make sense.</p>
    <div class="codeWrap"><pre><code>  [ your JavaScript ]
        |  Capacitor.registerPlugin() proxy
        v
  [ JS bridge ]   ---- serialises the call to JSON, posts it to native
        |            via window.Capacitor / WKScriptMessageHandler
        v
  [ native runtime ]  ---- Kotlin (@CapacitorPlugin) or Swift (CAPPlugin)
        |            looks up a method, checks permissions
        v
  [ platform API ]     ---- android.hardware.Camera2, UIImagePickerController
        |
        v
  [ result travels back up the same path as a JSON payload ]</code></pre></div>
    <p>Every call is asynchronous and every return value is structured-cloned JSON. That single constraint explains a whole family of common bugs: you cannot pass a function, a DOM node, or a class instance across the bridge, and you cannot rely on object identity being preserved.</p>
    <div class="warn"><p>Because the boundary is JSON, a plugin that takes a callback function will not work across it. This is why plugin methods are all promise-based and why you cannot hand native code a JavaScript function to call later. Design plugin APIs around request/response, not inversion of control.</p></div>

<h3 id="ch1-compare" data-toc>1.3 Capacitor vs Cordova vs React Native vs Flask'''

new = '''<h3 id="ch1-stack" data-toc>1.2 The layers from URL bar to JavaScript</h3>
    <p class="topic-desc">Walks the call path from your button click down to an OS API and back, so error messages make sense.</p>
    <h4 id="ch1-stack-callpath">The JavaScript call path</h4>
    <p>When a user interacts with your app — tap a button, submit a form, navigate to a new route — the event handler runs on the web view's main thread. If the handler calls a Capacitor plugin method, the function name and its arguments are gathered and serialised into a JSON payload. This payload is handed to the bridge, which posts it to the native side via <code>window.Capacitor</code> (Android) or <code>window.webkit.messageHandlers.Capacitor</code> (iOS/WKWebView). The native side deserialises the JSON, locates the registered plugin method, and invokes it.</p>
    <div class="codeWrap"><pre><code>// JavaScript: invoking a plugin method
import { Geolocation } from '@capacitor/geolocation';

async function getCurrentPosition() {
  const position = await Geolocation.getCurrentPosition({
    timeout: 10000,
    enableHighAccuracy: true,
  });
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
}

// the bridge turns this into a JSON post to native,
// then returns a structured-clone of the result as a promise fulfilment</code></pre></div>

    <h4 id="ch1-stack-bridge">The bridge transport</h4>
    <p>The bridge itself is a thin message-forwarding layer. On Android, it uses <code>WebView.postJavaScriptMessage()</code> to inject a <code>message</code> event into the web view's JavaScript context. The payload is a JSON string under the <code>data</code> property. On iOS, it uses <code>WKScriptMessageHandler</code> with a configured name — by default <code>Capacitor</code> — so the web view receives a <code>message</code> event whose <code>event.nativeMessage</code> contains the serialised call. In both cases the JavaScript side receives an event with <code>event.data</code> set to the parsed JSON object.</p>
    <div class="codeWrap"><pre><code>// Listening for a bridge response
window.addEventListener('message', (event) => {
  if (event && event.data && event.data.method) {
    const { method, params, result } = event.data;
    if (result) {
      console.log('Plugin result:', result);
    }
  }
});

// The native side posts a message like:
// { "method": "getCurrentPosition", "params": { "timeout": 10000 } }</code></pre></div>

    <h4 id="ch1-stack-return">The return journey</h4>
    <p>After the native method runs, its return value is structured-cloned into JSON and sent back across the bridge. The JavaScript promise resolves with the deserialised result. If the native method throws or rejects, the promise rejects with an error object containing a code and a message. This round-trip — JavaScript → JSON → native → JSON → JavaScript — typically takes 50–200 ms on a typical device, which is why plugin calls should always be written as <code>await</code> and never synchronously.</p>
    <div class="codeWrap"><pre><code>// JavaScript: awaiting the result
import { Camera } from '@capacitor/camera';

async function takePicture() {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Uri,
    });
    // this runs after the native bridge resolves
    imageElement.src = photo.webPath;
  } catch (e) {
    console.error('Camera plugin failed:', e);
  }
}

// if the call takes too long, you can set a timeout
const promise = Camera.getPhoto({ quality: 90 });
const timeout = setTimeout(() => {
  promise.then(() => {}).catch(() => console.error('bridge timeout'));
}, 10000);</code></pre></div>
</section>

<h3 id="ch1-compare" data-toc>1.3 Capacitor vs Cordova vs React Native vs Flask'''

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replacement successful')
else:
    print('Old string NOT found')
    # Debug: check if the h3 exists
    if 'ch1-stack' in content:
        print('ch1-stack heading found in file')
    else:
        print('ch1-stack heading NOT found')