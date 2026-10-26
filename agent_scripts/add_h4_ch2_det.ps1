$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

# Find the ch2-deterministic h3 position
$h3Tag = '<h3 id="ch2-deterministic" data-toc>Determinism, the weaker property</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "h3 position: $h3Pos"

if ($h3Pos -ge 0) {
    # Find the codeWrap opening after the h3
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap position: $cwPos"
    
    if ($cwPos -ge 0) {
        # Insert 3 h4s between the h3 and the codeWrap
        $h4s = @"
    <h4 id="ch2-det-goals">Practical reproducibility goals</h4>
    <p>While bit-identical builds are ideal, a practical target is: fixed toolchain version, pinned lockfile, no network access during build, and no timestamps. These four properties alone make a consumer able to verify integrity.</p>
    <div class="codeWrap"><pre><code>
// Practical reproducibility target
//   - fixed, documented toolchain version
//   - pinned lockfile  
//   - no network access during build
//   - -trimpath or equivalent
</code></pre></div>

    <h4 id="ch2-det-go-platform">Platform-specific concerns</h4>
    <p>Different ecosystems have different reproducibility profiles. Go needs -trimpath, Rust needs --remap-path-prefix, Debian has been reproducible since 2013, and Python wheels benefit from isolated build containers. Know your ecosystem's strengths.</p>
    <div class="codeWrap"><pre><code>
// Go: -trimpath removes build path embedment
go build -trimpath

// Rust: --remap-path-prefix fixes build paths
RUSTFLAGS="--remap-path-prefix=$PWD=." cargo build

// Debian: reproducible since 2013
</code></pre></div>

    <h4 id="ch2-det-achievable">Achievable reproducibility</h4>
    <p>Do not chase bit-identical builds for everything. Achieve: fixed toolchain, pinned lockfile, no network access, no timestamps. This is enough for a consumer to verify integrity, and signing/provenance chapters build on this.</p>
    <div class="codeWrap"><pre><code>
// Do not chase bit-identical builds for everything
//   - fixed, documented toolchain version
//   - pinned lockfile
//   - no network access during build
//   - -trimpath or equivalent
//   - recorded hash in release notes
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