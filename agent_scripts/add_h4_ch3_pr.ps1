$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-provenance" data-toc>Provenance attestation</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-provenance at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-prov-attestation">What provenance contains</h4>
    <p>Provenance says how the artefact was built: which workflow, from which commit, with which source, using which build definition. A typical SLSA provenance document includes buildDefinition, subject (artifact digests), and runDetails.</p>
    <div class="codeWrap"><pre><code>
// Provenance attestation structure
{
  "_type": "https://in-toto.io/Statement/v1",
  "subject": [{ "name": "pkg-1.2.3.tar.gz", "digest": { "sha256": "a3f5..." } }],
  "predicateType": "https://slsa.dev/provenance/v1",
  "predicate": {
    "buildDefinition": {
      "buildType": "https://github.com/actions/runner",
      "externalParameters": {
        "workflow": { "ref": "refs/heads/main", "repository": "https://github.com/yourorg/repo" }
      },
      "resolvedDependencies": [
        { "uri": "git+https://github.com/yourorg/repo@8f2a91",
          "digest": { "gitCommit": "8f2a91c4e7..." } }
      ]
    },
    "runDetails": {
      "builder": { "id": "https://github.com/actions/runner" },
      "metadata": { "invocationId": "..." }
    }
  }
}
</code></pre></div>

    <h4 id="ch3-prov-why-better">Why provenance is better than signing alone</h4>
    <p>Signing answers "was this signed by your key?" Provenance answers "was this built by your release workflow, from this commit, at this source?" A consumer can verify provenance without trusting the key, because identity comes from the CI provider's OIDC token.</p>
    <div class="codeWrap"><pre><code>
// Signing vs provenance
//   signing: "was this signed by your key?"
//   provenance: "was this built by your release workflow?"
</code></pre></div>

    <h4 id="ch3-prov-where-today">Where it exists today</h4>
    <p>npm publish --provenance, PyPI PEP 740, crates.io --attestations, Maven CycloneDX, containers cosign attest, NuGet signing. Consumers: $ npm audit signatures.</p>
    <div class="codeWrap"><pre><code>
// Ecosystems with provenance today
//   npm: npm publish --provenance
//   PyPI: PEP 740 attestations
//   crates.io: --attestations flag
//   Maven: CycloneDX via sigstore plugin
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-provenance"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-provenance done, new length: $($content.Length)"