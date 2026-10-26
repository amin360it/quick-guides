with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find ch1-limits section
old = '''<h3 id="ch1-limits" data-toc>1.4 What Capacitor is genuinely bad at</h3>
    <p class="topic-desc">The four workloads where a web view will feel wrong no matter how much you optimise, and what to do instead.</p>
    <ol>
      <li><strong>60+ fps continuous canvas or 3D rendering.</strong> A game loop, a video editor timeline, or a 3D scene will stutter because the web view compositor competes with your main thread. Offload to native or use a different tool.</li>
      <li><strong>Very long scrolling feeds with rich media.</strong> A list of ten thousand photos plus text is where DOM recycling and memory pressure hurt. Virtualise aggressively (chapter 12) or go native.</li>
      <li><strong>Background work that must not be killed.</strong> The web view is suspended aggressively in the background. Use a native background task, not a JavaScript timer (chapter 10).</li>
      <li><strong>Complex text input.</strong> Rich text editors, drawing input and IME-heavy forms are the weakest area. The web view gives you a real text engine, but native apps have better keyboard behaviours for gestures and selection.</li>
    </ol>'''

new = '''<h3 id="ch1-limits" data-toc>1.4 What Capacitor is genuinely bad at</h3>
    <p class="topic-desc">The four workloads where a web view will feel wrong no matter how much you optimise, and what to do instead.</p>
    <h4 id="ch1-limits-game">High-frequency canvas and 3D rendering</h4>
    <p>A web view runs on the same main thread as your application logic. While it is capable of rendering 2D and even basic 3D graphics, the compositor thread and the JavaScript thread share resources. A sustained 60 FPS frame budget of 16.7 ms per frame is rarely achievable when the web view must also handle layout, garbage collection, and bridge crossings. Games that rely on per-frame physics, WebGL2 contexts, or canvas pixel manipulation will experience jitter, dropped frames, and eventually animation stalls. If your application requires continuous high-throughput rendering, offload the rendering pipeline to a native view (Metal, OpenGL ES, or Vulkan) via a custom plugin, or use a dedicated game engine that can manage its own thread scheduling and present directly to the surface without a web view wrapper.</p>
    <div class="codeWrap"><pre><code>// Example: checking if your render loop will bottleneck
// Measure real frames per second on a device, not a desktop browser

const frameTimes = [];
function renderFrame(start) {
  const end = performance.now();
  frameTimes.push(end - start);
  if (frameTimes.length > 60) frameTimes.shift();
  const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  if (avg > 15) {
    console.warn('Frame budget exceeded:', avg.toFixed(2), 'ms');
  }
  requestAnimationFrame(renderFrame);
}
requestAnimationFrame(renderFrame);

// If average frame time consistently exceeds 16ms, consider:
// 1. Reducing overdraw and texture sizes
// 2. Moving the loop to a native view (see chapter 8)
// 3. Using a game engine instead of a web view</code></pre></div>

    <h4 id="ch1-limits-long-list">Very long scrolling feeds with rich media</h4>
    <p>DOM recycling is effective for dozens of list items, but once you approach thousands of entries, memory pressure becomes the limiting factor. Each visible <code><img></code> with a decoded bitmap holds width × height × 4 bytes in RAM. A gallery of 10,000 thumbnails, each at 400 × 300 pixels, consumes approximately 480 MB of decoded image data if all are loaded simultaneously. Even with <code>loading="lazy"</code>, the browser must keep references to detached elements, and the garbage collector may pause the main thread during cleanup. Virtualisation libraries (such as react-virtual or zen-columns) only render the visible window, but Capacitor's web view still carries the overhead of the full DOM tree. For feeds this size, go native or implement heavyweight virtualisation with Canvas or Metal backends.</p>
    <div class="codeWrap"><pre><code>// Lightweight virtualisation pattern
// Only render items visible in the viewport + buffer

const ITEM_HEIGHT = 80;
const VIEWPORT_HEIGHT = window.innerHeight;
const BUFFER = 2;

function computeVisibleRange(items, scrollTop) {
  const totalHeight = items.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor((scrollTop - BUFFER * ITEM_HEIGHT) / ITEM_HEIGHT));
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT + BUFFER * ITEM_HEIGHT) / ITEM_HEIGHT)
  );
  return { startIndex, endIndex };
}

// Usage in your render function
function renderList(items, scrollTop) {
  const { startIndex, endIndex } = computeVisibleRange(items, scrollTop);
  const visibleItems = items.slice(startIndex, endIndex + 1);
  return visibleItems.map((item, i) => renderItem(item, i + startIndex));
}</code></pre></div>

    <h4 id="ch1-limits-background">Background work that must not be killed</h4>
    <p>JavaScript timers — <code>setTimeout</code>, <code>setInterval</code>, and <code>fetch</code> promises — are cancelled as soon as the application enters the background. The operating system suspends the web view process, and any in-flight timers are lost. If your application requires work to continue while backgrounded (such as playing audio, syncing a local database, or keeping a WebSocket alive), you must use platform-native mechanisms. On iOS, use <code>BGAppRefreshTask</code> or <code>fetch</code> silent pushes. On Android, use <code>WorkManager</code> or a foreground service with an ongoing notification. JavaScript cannot reliably schedule work that survives suspension, and attempting to do so will lead to missed deadlines and data inconsistency.</p>
    <div class="codeWrap"><pre><code>// DO NOT rely on this in the background — it will not work
setInterval(() => syncData(), 60_000); // suspended when app goes background

// DO use native background mechanisms instead
// iOS: BGAppRefreshTask (see chapter 10)
// Android: WorkManager (see chapter 10)

// Example: scheduling periodic sync with WorkManager
// (registered in the native project, not from JavaScript)

/* Kotlin (Android)
class SyncWorker : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        syncData()
        return Result.success()
    }
}

// In the app's initialization:
val request = PeriodicWorkRequestBuilder(SyncWorker, 15, TimeUnit.MINUTES)
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.MINUTES)
    .build()
WorkManager.getInstance(context).enqueueUniqueWork(
    "sync_work", ExistingPeriodicWorkPolicy.REPLACE, request);
*/
</code></pre></div>

    <h4 id="ch1-limits-text-input">Complex text input and IME</h4>
    <p>Rich text editing, custom IME (Input Method Editor) workflows, and text fields with complex gesture handling are the weakest area of the web view. The native text engine is capable and standards-compliant, but input method coordination — such as composing characters with diacritics, handling prediction and autocorrect, and managing cursor movement via touch — often breaks down when the web view sits between the native keyboard and your application logic. Double-byte input, right-to-left scripts, and voice input all require careful platform bridging. If your application depends on precise text input, test on both platforms and consider whether a native text input component or a dedicated library is required.</p>
    <div class="codeWrap"><pre><code>// Feature-detect for IME support
// Check whether the native platform supports composition events

function supportsComposition() {
  return 'CompositionEvent' in window || typeof document.oncompositionstart !== 'undefined';
}

// Handle composition events for Japanese/Korean input
textInput.addEventListener('compositionstart', (e) => {
  isComposing = true;
  compositionBuffer = '';
});

textInput.addEventListener('compositionend', (e) => {
  isComposing = false;
  // Process the completed composition
  if (compositionBuffer.length > 0) {
    console.log('Composition completed:', compositionBuffer);
  }
});

// Important: also listen for input events, as compositionend
// may not fire in all browser/engine combinations
textInput.addEventListener('input', (e) => {
  if (!isComposing) {
    // Real-time input handling when not composing
    console.log('Input value:', e.target.value);
  }
});
</code></pre></div>
</section>

<h3 id="ch1-webdir" data-toc>1.5 webDir and the asset contract</h3>'''

if old in content:
    content = content.replace(old, new)
    with open(r'C:\Users\user\repo\learn-software-engineering\capacitor.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replacement successful for ch1-limits')
else:
    print('Old string NOT found for ch1-limits')
    # Debug
    idx = content.find('id="ch1-limits" data-toc')
    if idx >= 0:
        print('ch1-limits found at', idx)
    else:
        print('ch1-limits NOT found')