$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-shape" data-toc>The shape of an npm package</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-shape at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-shape-exports">exports field</h4>
    <p>The exports field enforces the public API. Deep-imports outside the exports field stop resolving for consumers. This is a breaking change for anyone deep-importing, so do it in a major release.</p>
    <div class="codeWrap"><pre><code>
// Enforce the public API with exports
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
}
</code></pre></div>

    <h4 id="ch4-shape-type">"type" field reach</h4>
    <p>"type": "module" makes every .js in the package an ES module. A package without it is CommonJS, and an ESM consumer importing it gets an ERR_REQUIRE_ESM or named-export error. Get this right on day one.</p>
    <div class="codeWrap"><pre><code>
// "type": "module" makes all .js ES modules
"type": "module"

// Without it, package is CommonJS; ESM import fails
</code></pre></div>

    <h4 id="ch4-shape-files">"files" field</h4>
    <p>Without "files", npm uses .gitignore, and then everything you have ignored is published too. With "files", the list is authoritative. Always set it.</p>
    <div class="codeWrap"><pre><code>
// Always set the "files" field
"files": ["dist", "README.md", "LICENSE"]
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-shape"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-shape done, new length: $($content.Length)"