$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-oidc" data-toc>Short-lived credentials with OIDC</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-oidc at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-oidc-problem">Problem: long-lived tokens</h4>
    <p>Long-lived NPM tokens stored in CI secrets, developer laptops, or shell history are valid for months. If phished, the attacker can publish as you indefinitely. This is the most common attack class.</p>
    <div class="codeWrap"><pre><code>
// Long-lived token (anti-pattern)
$ npm config set //registry.npmjs.org/:_authToken=npm_abc123...
// token valid for months, in CI secrets, history, screenshots
</code></pre></div>

    <h4 id="ch3-oidc-solution">OIDC solution</h4>
    <p>Your CI provider already has a short-lived identity token signed by the provider. Exchange it at the registry's token endpoint, which verifies the signature and checks repository/workflow matching. You get a credential valid for minutes with no secret to steal.</p>
    <div class="codeWrap"><pre><code>
// OIDC exchange: short-lived, no secret
//   CI provider signs the token, registry verifies it
//   valid for minutes, no secret to steal
</code></pre></div>

    <h4 id="ch3-oidc-permissions">Required permissions</h4>
    <p>Only two permissions are needed: id-token: write (enables the exchange) and contents: read (all else you need). With only these, a compromised action can mint a publish token but not do more.</p>
    <div class="codeWrap"><pre><code>
// Minimal permissions block
permissions:
  id-token: write    # enables the OIDC exchange
  contents: read     # all else you need
</code></pre></div>

    <h4 id="ch3-oidc-residual">Residual risk</h4>
    <p>OIDC does not protect against an attacker who can push to your release branch or modify the release workflow. It protects against credential theft, which is the actual attack class.</p>
    <div class="codeWrap"><pre><code>
// OIDC does not protect against:
//   - attacker pushing to release branch
//   - modified release workflow
// It does protect against: credential theft (phished password/TOTP)
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-oidc"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-oidc done, new length: $($content.Length)"