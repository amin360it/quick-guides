$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-mcp" data-toc>Untrusted publishing and the new protections</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-mcp at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-mcp-protections">The protections</h4>
    <p>1. TRUSTED PUBLISHING: no token to paste, attack has nothing to steal. 2. HARDWARE-KEY-ENFORCED 2FA for publishing. 3. POST-INSTALL APPROVAL: npm 11 prompts before running install scripts. 4. INSTALL-SCRIPT BLOCKING: --ignore-scripts, ignore-scripts=true in .npmrc. 5. AUTOMATED MALWARE DETECTION: automatic yanking on registry side. 6. RATE LIMITING: new-package publication delay limits typosquat window.</p>
    <div class="codeWrap"><pre><code>
// The six protections
//   1. Trusted publishing - no token to steal
//   2. Hardware-key-enforced 2FA
//   3. Post-install approval: npm 11 prompts
//   4. Install-script blocking: --ignore-scripts
//   5. Automated malware detection with auto-yanking
//   6. Rate limiting on new-package publication
</code></pre></div>

    <h4 id="ch4-mcp-user-facing">User-facing documentation</h4>
    <p>- tell people not to paste credentials into CLI tools. - tell them a legitimate migration tool never needs their token. - tell them what to do if they already did: revoke the token now, and audit what was published.</p>
    <div class="codeWrap"><pre><code>
// User-facing docs section
//   - tell people not to paste credentials into CLI tools
//   - a legitimate migration tool never needs your token
//   - if you already did: revoke the token now
</code></pre></div>

    <h4 id="ch4-mcp-own-package">For your own package</h4>
    <p>- enable 2FA and prefer a hardware key. - use trusted publishing. - publish from CI only. - keep the maintainer count small and current. - a 0-dependency package is a package with no supply chain.</p>
    <div class="codeWrap"><pre><code>
// For your own package
//   - enable 2FA and prefer a hardware key
//   - use trusted publishing
//   - publish from CI only
//   - keep maintainer count small and current
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-mcp"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-mcp done, new length: $($content.Length)"