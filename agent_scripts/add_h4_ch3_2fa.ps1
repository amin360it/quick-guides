$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch3-2fa" data-toc>Account security is the real boundary</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch3-2fa at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch3-2fa-minimum">The minimum, and it is not optional</h4>
    <p>Every defence in this chapter assumes the attacker does not have your maintainer account. In every real incident, they did. So account security is the first control.</p>
    <p>Minimum requirements: 2FA on every registry account with a hardware key (YubiKey), a sign-in notification, and a separate account per person. No shared maintainer logins.</p>
    <div class="codeWrap"><pre><code>
// Minimum requirements for account security
//   - 2FA on every registry account, with a hardware key (YubiKey)
//   - a sign-in notification, treat unexpected as incident
//   - separate account per person, no shared maintainer logins
</code></pre></div>

    <h4 id="ch3-2fa-organisational">Organisational controls that actually work</h4>
    <p>Protected release environment requiring reviewer approval, signed tags, branch protection on the release branch, an audit log of publishes reviewed by someone other than the publisher, and a documented recovery path.</p>
    <div class="codeWrap"><pre><code>
// Organisational controls that work
//   - protected release environment requiring reviewer approval
//   - signed tags
//   - branch protection on release branch
//   - audit log of publishes, reviewed by someone other than publisher
</code></pre></div>

    <h4 id="ch3-2fa-bit-skipped">The bit people skip</h4>
    <p>Remove maintainers who have left every former maintainer is a permanent credential risk. Do it the day someone leaves, not at the next audit, and check every registry you have ever published to.</p>
    <div class="codeWrap"><pre><code>
// Remove departed maintainers
//   - the day someone leaves, not at the next audit
//   - check every registry you have ever published to
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch3-2fa"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch3-2fa done, new length: $($content.Length)"