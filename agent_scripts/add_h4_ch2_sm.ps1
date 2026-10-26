$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-sourcemaps" data-toc>Source maps and debuggability</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-sourcemaps at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-sm-types">Type declarations are not optional</h4>
    <p>Ship the .d.ts file, or consumers get an implicit-any error at their import. This is the single most common reason a TS package is described as "broken" and it is a packaging failure, not a bug.</p>
    <div class="codeWrap"><pre><code>
// TypeScript declarations are not optional for a TS-first package
//   ship the .d.ts, or consumers get an implicit-any error at their import
"types": "./dist/index.d.ts",
</code></pre></div>

    <h4 id="ch2-sm-exports">exports field for resolution</h4>
    <p>The exports field enforces the public API. Deep-imports outside the exports field stop resolving for consumers. This is a breaking change for anyone deep-importing, so do it in a major release.</p>
    <div class="codeWrap"><pre><code>
// Enforce the public API with exports
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
}
</code></pre></div>

    <h4 id="ch2-sm-type-reveal">Type reveal in debugger</h4>
    <p>Source maps resolve frames into YOUR source, even though the consumer only has your dist. Add "sourceRoot" so a browser can fetch the original file from the registry.</p>
    <div class="codeWrap"><pre><code>
// Add sourceRoot so browser can fetch original
"sourceRoot": "https://unpkg.com/your-pkg@1.2.3/"
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-sourcemaps"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-sourcemaps done, new length: $($content.Length)"