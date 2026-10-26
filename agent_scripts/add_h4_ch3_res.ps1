$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-response" data-toc>Responding to a compromise</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-response at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-response-minute-0">Minute 0: stop the bleeding</h4>
    <p>Yank the malicious version immediately, revoke the publish token at every registry, invalidate CI secrets, and assume any CI secret is compromised if a maintainer account was compromised.</p>
    <div class="codeWrap"><pre><code>
// Minute 0: stop the bleeding
//   - yank the malicious version immediately
//   - revoke the publish token at every registry you use
//   - invalidate the CI secrets if the build was the entry point
//   - assume any CI secret is compromised if a maintainer account was compromised
</code></pre></div>

    <h4 id="ch3-response-minute-5">Minute 5-30: work out the scope</h4>
    <p>Read the payload exactly. Determine which versions were affected (every version published while the credential was in the attacker's hands). Be honest: if you do not know, say so publicly.</p>
    <div class="codeWrap"><pre><code>
// Minute 5-30: work out the scope
//   - read the payload, do not guess
//   - which versions were affected?
//   - was the build pipeline modified?
</code></pre></div>

    <h4 id="ch3-response-hour-1">Hour 1-6: notify</h4>
    <p>Notify: npm audit advisory, PyPI PSRT, RustSec database, GitHub Security tab, and YOUR USERS directly. Silence turns an incident into a breach.</p>
    <div class="codeWrap"><pre><code>
// Hour 1-6: notify
//   - npm: npm audit advisory
//   - PyPI: report to PSRT, python-security@python.org
//   - GitHub: advisory in the repository's Security tab
//   - YOUR USERS directly: changelog, advisory, email, blog post
</code></pre></div>

    <h4 id="ch3-response-day-1">Day 1-7: recover</p>
    <p>Publish a fixed version. Consider whether previous good versions are still safe to pin. If the attack was a maintainer-account compromise, an earlier version published before the compromise is probably fine. Explicitly say so.</p>
    <div class="codeWrap"><pre><code>
// Day 1-7: recover
//   - publish a fixed version
//   - consider whether earlier versions are safe to pin
//   - rotate every credential you touched
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-response"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-response done, new length: $($content.Length)"