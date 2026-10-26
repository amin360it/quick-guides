# Style Guide for android-apps.main.html Fragment

## Output Contract

Write ONLY `<section class="chapter">` blocks. No `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, `<main>`, `<h1>`, `<aside>`, `<footer>`, or `<script>` tags. Your output is a fragment that will be concatenated with other chapters.

## Section Structure

```
<section class="chapter">
<h2 id="chN" data-toc>N · Chapter Title</h2>

<h3 id="chN-xxx" data-toc>N.M Sub-section Title</h3>
<p class="topic-desc">One-sentence orientation: what this sub-section covers and why it matters.</p>

<h4 id="chN-xxx-focus">Descriptive Focus Heading</h4>
<p>Dense prose. Real engineering explanation. Not bullet points — flowing paragraphs with <code>inline code</code> where it clarifies.</p>

<h4 id="chN-xxx-more">Second Focus Heading (if needed)</h4>
<p>More dense prose.</p>

<div class="codeWrap"><pre><code>// code here</code></pre></div>

<div class="tip"><p>...</p></div>  (or warn, note, ex)

<h3 id="chN-yyy" data-toc>N.M+1 Next Sub-section</h3>
...
</section>
```

## Hard Rules

1. **Every `<h2>` and `<h3>` carries `data-toc`.** The h2 id is exactly `chN` (e.g. `ch1`, `ch2`). h3 ids are prefixed `chN-` (e.g. `ch1-model`, `ch2-layout`).
2. **Every `<h4>` has a unique id** in the format `chN-xxx-descriptive` (e.g. `ch1-model-components`). h4 elements are NOT given data-toc — only h2 and h3 get data-toc.
3. **Every `<h3>` must contain at least 1 `<h4>` sub-heading followed by dense prose.**
4. **Every `<h3>` must contain at least 2 `<div class="codeWrap"><pre><code>...</code></pre></div>` code samples.**
5. **Escape code exactly once**: inside code samples, write `&lt;` for `<`, `&gt;` for `>`, `&amp;` for `&`. NEVER write `&amp;lt;`, `&amp;amp;`, or a bare `&` followed by non-entity text. XML layouts, Kotlin generics (`List&lt;String&gt;`), HTML tags, and URLs with query strings (`?a=1&amp;b=2`) MUST be escaped.
6. **Callouts**: only `<div class="tip">`, `<div class="warn">`, `<div class="note">`, `<div class="ex">`. Each contains a `<p>`. Never invent other classes.
7. **Every id must be unique across the whole file.**
8. **Depth floor**: each `<h3>` section must carry **at least ~1,500 bytes of prose** (code blocks and tables excluded). That's roughly 4-6 substantial paragraphs of flowing prose. Write real explanation, not bullet-point lists. Each paragraph should be 3-8 sentences. Use `<code>` inline for class names, methods, and constants. Use `<table>` sparingly for comparison data (tables don't count toward the 1,500-byte prose floor).
9. **Tone**: precise, opinionated, practical engineering guide. Real Kotlin/XML, real Gradle, real Firebase config, real reasoning. No filler, no "in this chapter we will..." transitions, no bullet-point outlines. Write as if to a senior engineer who knows Java but is new to Android specifics.
10. **Code samples must be real, compilable Android code**: Kotlin for logic, XML for layouts/manifests, Groovy or Kotlin DSL for Gradle, JSON for config files. Use realistic package names (e.g. `com.acme.app`), realistic method bodies, not `// TODO` stubs. Each code block should be 15-40 lines of meaningful content.
11. **Prose explains WHY**, not just WHAT. When showing a code pattern, the surrounding prose should explain the tradeoff, the lifecycle implication, or the failure mode being avoided.

## Prose Depth Guidance

~1,500 bytes of prose per h3 means roughly 600-900 words. Structure it as:
- 2-4 paragraphs of flowing prose under each h4 (if 2+ h4s, split the prose between them)
- Each paragraph makes a specific engineering point and connects to the next
- Use `<code>` for inline references to classes, methods, attributes, constants
- Reference the code samples that follow by explaining what pattern they demonstrate
- End with a practical consequence: what breaks if you get this wrong

## Content Specificity

Use these real Android APIs and versions:
- Kotlin 1.9+, compileSdk 34, minSdk 24, targetSdk 34
- AndroidX: `androidx.core:core-ktx`, `androidx.appcompat:appcompat`, `com.google.android.material:material`, `androidx.constraintlayout:constraintlayout`, `androidx.recyclerview:recyclerview`, `androidx.fragment:fragment-ktx`, `androidx.navigation:navigation-fragment-ktx`, `androidx.lifecycle:lifecycle-viewmodel-ktx`, `androidx.lifecycle:lifecycle-service`, `androidx.work:work-runtime-ktx`, `androidx.room:room-runtime`, `androidx.datastore:datastore-preferences`, `com.squareup.retrofit2:retrofit`
- Firebase: `com.google.firebase:firebase-messaging`, `com.google.firebase:firebase-bom`, `google-services.json`, `FirebaseMessagingService`, `RemoteMessage`, `FirebaseInstanceId`
- Notification channels (API 26+), `POST_NOTIFICATIONS` permission (API 33+), `NotificationCompat.Builder`, `PendingIntent`
- Coroutines: `CoroutineScope`, `Dispatchers.IO`, `viewModelScope`, `lifecycleScope`, `suspend fun`
- Gradle: `build.gradle.kts`, `buildFeatures { viewBinding = true }`, `buildTypes`, `productFlavors`
- Material Components 1.11+, ConstraintLayout 2.1+
- Room: `@Entity`, `@Dao`, `@Database`, `Room.databaseBuilder`, `Migration`
- DataStore: `preferencesDataStore`, `Flow`, `edit`, `map`
- Retrofit: `@GET`, `@POST`, `suspend` functions, `Retrofit.Builder`, `OkHttpClient`, `MoshiConverterFactory`

## What Makes Good Content

BAD: "Services are components that run in the background. There are two types: started and bound. Started services are started with startService() and bound services with bindService()."

GOOD: "A started service is declared in the manifest and started with `startService()`. Once running, it has no binding to the component that started it — if the user navigates away and the activity is destroyed, the service keeps running. This makes it appropriate for work that must complete regardless of UI (uploading a file, syncing data), but it also means the service must stop itself with `stopSelf()` when done, or it leaks system resources. The system grants started services no special priority; under memory pressure they are killed like any other process."
