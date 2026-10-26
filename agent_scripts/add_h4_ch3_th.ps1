$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-threats" data-toc>What the threat model actually is</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-threats at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-threats-model">Threat model definition</h4>
    <p>Threat modeling identifies the assets, attack vectors, and adversaries relevant to your package. It answers: what can happen, how likely, and what the impact is. Without a model, security decisions are ad hoc.</p>
    <div class="codeWrap"><pre><code>
// Threat modeling, the four questions
// 1. What are we protecting? (assets, credentials, artefacts)
// 2. What can happen? ( threat actors, attack vectors)
// 3. What is the likelihood? (probability, frequency)
// 4. What is the impact? (business, reputational, legal)
</code></pre></div>

    <h4 id="ch3-threats-incidents">Notable incidents</h4>
    <p>The event-stream, ua-parser-js, coa, rc, colors, and faker incidents (2020-2022) share a common pattern: a maintainer's NPM token was phished via a "package migration" tool prompt, and a postinstall script exfiltrated environment variables and cloud credentials.</p>
    <div class="codeWrap"><pre><code>
// Incident pattern: event-stream (2022)
// Maintainer phished for "migration tool" token
// Postinstall script exfiltrated credentials and browser data
// Package had 2M+ weekly downloads
</code></pre></div>

    <h4 id="ch3-threats-defences">Defences that matter</h4>
    <p>The four threats in order of likelihood: 1. CREDENTIAL COMPROMISE (most common), 2. DEPENDENCY CONFUSION, 3. THE BUILD ITSELF, 4. THE REGISTRY ITSELF. Defences: OIDC, 2FA, lockfiles, and provenance attestation.</p>
    <div class="codeWrap"><pre><code>
// The four threats, ordered by likelihood
// 1. CREDENTIAL COMPROMISE  (most common by wide margin)
// 2. DEPENDENCY CONFUSION
// 3. THE BUILD ITSELF
// 4. THE REGISTRY ITSELF
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-threats"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-threats done, new length: $($content.Length)"