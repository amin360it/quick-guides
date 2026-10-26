$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-trouble" data-toc>Troubleshooting</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-trouble at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-trouble-module-not-found">"Cannot find module"</h4>
    <p>Use npm ls to determine if the package is a direct dependency or hoisted. Use npm why (npm 8+) to understand why it is there. Check the "exports" field and whether the consumer is ESM importing your CJS.</p>
    <div class="codeWrap"><pre><code>
// Module not found diagnostic
$ npm ls yourpkg                    // is it a direct dep, or hoisted?
$ npm why yourpkg                   // npm 8+: why is it here
// "named export 'x' not found": check the "exports" field
// "Unsupported directory import": add the subpath or import the root
</code></pre></div>

    <h4 id="ch4-trouble-peer-conflict">ESRESOLVE / peer dependency conflict</h4>
    <p>Read the actual conflict first; often a peer range is too narrow. Using --legacy-peer-deps makes it work but explains nothing.</p>
    <div class="codeWrap"><pre><code>
// ERESOLVE / peer dependency conflict
$ npm install --legacy-peer-deps   // makes it work, explains nothing
// read the actual conflict first - often a peer range too narrow
</code></pre></div>

    <h4 id="ch4-trouble-engine-warnings">engine node warnings</h5>
    <p>Cosmetic. Do not suppress it; read whether it matters. The package may have been published without dist/.</p>
    <div class="codeWrap"><pre><code>
// engine node warnings
//   cosmetic. do not suppress it, read whether it matters.
//   the package published without dist/
</code></pre></div>

    <h4 id="ch4-trouble-published-version">A version published, cannot republish</h5>
    <p>Versions are immutable. Bump to a new version. If you need to remove one, unpublish within 72 hours, then republish.</p>
    <div class="codeWrap"><pre><code>
// A version published, cannot republish
//   versions are immutable. bump to a new version.
//   if you need to remove one, unpublish within 72 hours, then republish.
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-trouble"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-trouble done, new length: $($content.Length)"