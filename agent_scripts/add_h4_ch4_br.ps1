$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-browsers" data-toc>CDN distribution and import maps</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-browsers at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-browsers-cdn">CDN shims for browser distribution</h4>
    <p>Three CDN shims exist: esm.sh (most capable, can pin target and bundle), jsdelivr (fast, dumb, popular), and unpkg (file server, /browse). Esm.sh can resolve subpath exports and pin a target.</p>
    <div class="codeWrap"><pre><code>
// Three CDN shims
//   esm.sh    bundles for exact target, resolves subpath exports, can pin target: ?target=es2022, ?bundle
//   jsdelivr  pure file server with /+esm for on-the-fly ESM conversion, /npm/ prefix for bare specifiers
//   unpkg    file server only, /browse for exploring what is in the package
</code></pre></div>

    <h4 id="ch4-browsers-importmap">Import maps for pinning versions</h4>
    <p>Import maps allow bare specifiers to resolve with no bundler. Browsers have supported import maps since 2023. List pinned versions in the imports object.</p>
    <div class="codeWrap"><pre><code>
// Import map for pinning versions
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
    "date-fns": "https://esm.sh/date-fns@4.1.0"
  }
}</script>
<script type="module">
  import { format } from "date-fns";
</script>
</code></pre></div>

    <h4 id="ch4-browsers-decision">Library decision: CDN or not</h4>
    <p>A library that works from a CDN gets a try-before-install audience. If your package has a build step and cannot be consumed as source, you have given that up. "exports", a proper "browser" or "module" entry, and ESM output with no Node built-ins in the browser path make it work.</p>
    <div class="codeWrap"><pre><code>
// Decision: library that works from a CDN
//   gets a try-before-install audience
//   needs: "exports", "browser"/"module" entry, ESM output, no Node built-ins
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-browsers"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-browsers done, new length: $($content.Length)"