$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-integrity" data-toc>Integrity and checksums</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-integrity at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-integrity-checksums">Checksums as baseline</h4>
    <p>Checksums prove the artefact has not changed since publication. npm verifies integrity hashes from package-lock.json on every install. PyPI uses --require-hashes. Go uses go.sum. These are the weakest defence: they do not prove authenticity.</p>
    <div class="codeWrap"><pre><code>
// npm integrity hash in package-lock.json
"node_modules/express": {
    "version": "4.19.2",
    "resolved": "https://registry.npmjs.org/express/-/express-4.19.2.tgz",
    "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfzti8kAvl8RV4Te2Jg=="
}

// PyPI --require-hashes
pip install --require-hashes -r requirements.txt
# sha256:...  package-a==1.2.3
</code></pre></div>

    <h4 id="ch3-integrity-limitations">Checksums do not prove authenticity</h4>
    <p>If the attacker has your token, they publish an artefact and the registry computes a valid checksum. The checksum is correct, but the content is hostile. Checksums are necessary but not sufficient.</p>
    <div class="codeWrap"><pre><code>
// Checksums prove integrity only, not authenticity
//   correct checksum + hostile content = valid but malicious package
//   this is why signing and provenance are separate properties
</code></pre></div>

    <h4 id="ch3-integrity-other-ecosystems">Checksums in other ecosystems</h4>
    <p>Cargo uses checksums in Cargo.lock, Go uses go.sum (mandatory), NuGet uses .snupkg with signature, Maven uses .asc files with -gpg. RubyGems uses .gem.aside the .gem.</p>
    <div class="codeWrap"><pre><code>
// Ecosystem checksum defaults
//   Go: go.sum (mandatory, checksums only)
//   Cargo: Cargo.lock (checksums)
//   npm: package-lock.json (exact versions + integrity hashes)
//   PyPI: --require-hashes (enforced by pip)
//   NuGet: .snupkg + signature
//   Maven: .asc + -gpg
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-integrity"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-integrity done, new length: $($content.Length)"