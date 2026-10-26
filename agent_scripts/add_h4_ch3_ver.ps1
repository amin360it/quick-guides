$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-verify" data-toc>Verifying a dependency, and the limits</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-verify at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-verify-what">What you can verify</h4>
    <p>You can verify: the bytes are the bytes published, those bytes were signed by a key you have independently obtained, the artefact was built by a named workflow from a named commit. You cannot verify: the code is safe, the maintainer is trustworthy, the build was not compromised.</p>
    <div class="codeWrap"><pre><code>
// What you CAN verify
//   - bytes match what was published
//   - bytes signed by independently-obtained key
//   - built by named workflow, from named commit

// What you CANNOT verify
//   - code is safe
//   - maintainer is trustworthy
//   - build was not compromised
</code></pre></div>

    <h4 id="ch3-verify-pipeline">Verification pipeline in CI</h4>
    <p>A CI pipeline that checks every package resolved from expected registries, verifies provenance where expected, and checks for lifecycle scripts. Run on every push and pull request.</p>
    <div class="codeWrap"><pre><code>
// Verification pipeline in CI
name: verify-supply-chain
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node scripts/check-registries.mjs
      - name: verify npm provenance
        run: npm audit signatures --json > sigs.json
      - run: |
        node -e '
          const s = require("./sigs.json");
          const missing = Object.entries(s.packages ?? {})
            .filter(([name, v]) => !v.verified && v.attestations === undefined)
            .map(([name]) => name);
          if (missing.length) { console.error("no signature or provenance: " + missing.join(", ")); process.exit(1); }
        '
</code></pre></div>

    <h4 id="ch3-verify-ignorescripts">--ignore-scripts is highest-value flag</p>
    <p>The payloads in event-stream and ua-parser-js were postinstall scripts. Blocking install scripts blocks most supply-chain malware, at the cost of a small number of legitimate packages that need a native build step.</p>
    <div class="codeWrap"><pre><code>
// --ignore-scripts is the highest-value single flag
$ npm ci --ignore-scripts
// If you cannot turn it on globally, turn it on in CI and allow exceptions explicitly
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-verify"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-verify done, new length: $($content.Length)"