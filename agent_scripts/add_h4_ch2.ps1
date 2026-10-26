$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

# Find the ch2-artefact h3 position
$h3Tag = '<h3 id="ch2-artefact" data-toc>What is actually in the published file</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "h3 position: $h3Pos"

if ($h3Pos -ge 0) {
    # The codeWrap starts right after the h3
    # Find the codeWrap opening
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap position: $cwPos"
    
    if ($cwPos -ge 0) {
        # Insert the 3 h4s between the h3 and the codeWrap
        $h4s = @"
    <h4 id="ch2-artefact-contents">Contents of the published file</h4>
    <p>The published artefact is a TARBALL or ZIP whose contents determine what consumers install. A minimal package includes only essential files, while an unconstrained publish may include development tooling, test fixtures, or large assets that balloon the install size.</p>
    <div class="codeWrap"><pre><code>
// Minimal npm package publish: only these files reach the consumer
// "files" field in package.json acts as the authoritative list
"files": ["dist", "README.md", "LICENSE"]
</code></pre></div>

    <h4 id="ch2-artefact-npmignore">The .npmignore gate</h4>
    <p>When .npmignore is absent, npm falls back to .gitignore, which can inadvertently exclude code or include development files. The single most effective CI step is: <code>$ npm pack --dry-run</code> before every publish.</p>
    <div class="codeWrap"><pre><code>
// Always preview the publish tarball before committing
$ npm pack --dry-run
npm notice 1.2.3
npm notice === Tarball Contents ===
npm notice 120kB  dist/index.js          (built)
npm notice  14kB  dist/index.d.ts        (types, if you ship them)
npm notice  23kB  dist/index.js.map      (source map)
npm notice   2kB  README.md
npm notice   1kB  LICENSE
npm notice 400kB  src/                   (often included by accident)
npm notice   3kB  .eslintrc.json         (never useful to a consumer)
</code></pre></div>

    <h4 id="ch2-artefact-wheel">SDist vs Wheel</h4>
    <p>Python packages ship both an sdist (source distribution) and a wheel (pre-built binary). The sdist is needed for platforms lacking a wheel, while the wheel is what most consumers install. Publishing only an sdist means every install compiles; publishing only a wheel excludes platforms without a compatible wheel.</p>
    <div class="codeWrap"><pre><code>
// Python: build and verify both artefact types
$ python -m build              # builds sdist and wheel
$ twine check dist/*           # verify wheel integrity

// Platform-specific wheel
$ pip install mypkg-1.2.0-py3-none-any.whl  // pure Python, no compile needed
</code></pre></div>
"@

        # Insert the h4s before the codeWrap
        $insertPos = $cwPos
        $content = $content.Insert($insertPos, $h4s)
        Write-Host "Inserted h4s at position $insertPos"
    }
}

# Write the modified content back
[System.IO.File]::WriteAllText($file, $content)
Write-Host "File written successfully"