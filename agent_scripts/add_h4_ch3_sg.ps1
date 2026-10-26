$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-signing" data-toc>Signing the artefact</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-signing at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-signing-npm">npm provenance</h4>
    <p>npm publish --provenance generates a Sigstore attestation binding the artefact hash, the workflow file, git commit, and repository. Verify with <code>npm audit signatures</code>.</p>
    <div class="codeWrap"><pre><code>
// npm publish with provenance
$ npm publish --provenance --access public
$ npm audit signatures
// checks every installed package against the public transparency log
</code></pre></div>

    <h4 id="ch3-signing-sigstore">Sigstore cross-ecosystem answer</h4>
    <p>Sigstore provides cross-ecosystem signing: <code>cosign sign-blob</code> and <code>cosign verify-blob</code> with OIDC-based identity. No key management required.</p>
    <div class="codeWrap"><pre><code>
// Sigstore keyless signing
$ cosign sign-blob --key env://COSIGN_PUBKEY dist/pkg-1.2.3.whl
$ cosign verify-blob --key env://COSIGN_PUBKEY \
    --certificate-identity https://github.com/yourorg/repo/.github/workflows/release.yml \
    --certificate-oidc-issuer https://token.actions.githubusercontent.com \
    dist/pkg-1.2.3.whl
</code></pre></div>

    <h4 id="ch3-signing-pleasesign">Why you should sign</h3>
    <p>The 2020-2022 npm compromise chain failed partly because signing was opt-in and nobody verified. A signed package that nobody checks is security theatre. If you sign, your CI should also verify signatures on the way in.</p>
    <div class="codeWrap"><pre><code>
// Why signing matters
//   Without verification, signing is security theatre
//   CI should verify every installed package signature
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-signing"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-signing done, new length: $($content.Length)"