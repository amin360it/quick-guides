$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-unpkg" data-toc>The no-build path</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-unpkg at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-unpkg-nothing">Ship a single ESM .js file</h4>
    <p>Works from a CDN today. No build step needed. Just ship a single ESM .js file that imports each other with explicit .js extensions.</p>
    <div class="codeWrap"><pre><code>
// Nothing: ship a single ESM .js file
// Works from a CDN today
import { formatDate } from "./utils.js";
</code></pre></div>

    <h4 id="ch4-unpkg-with-TS">Publish source .ts and let consumer transform</h4>
    <p>JSR publishes source .ts and lets the consumer transform. In the browser it needs a transform service, which you should not rely on.</p>
    <div class="codeWrap"><pre><code>
// With TS: publish source .ts
// JSR does this. In the browser it needs a transform service,
// which you should not rely on.
<script type="module">
  import { retry } from "https://jsr.io/@yourorg/retry";
</script>
</code></pre></div>

    <h4 id="ch4-unpkg-blocks">Blocks the no-build path</h5>
    <p>Bare specifiers in your own imports, Node built-ins, CJS-only dependencies, TypeScript syntax in the shipped file, and dynamic require() block the no-build path.</p>
    <div class="codeWrap"><pre><code>
// Blocks the no-build path
//   - bare specifiers: import { x } from './util' must be ./util.js
//   - Node built-ins: import { readFile } from 'fs'
//   - CJS-only dependency
//   - TypeScript syntax in shipped file
//   - dynamic require()
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-unpkg"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-unpkg done, new length: $($content.Length)"