$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-scopes" data-toc>Scopes, and publishing under a namespace</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-scopes at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-scopes-npm">npm scopes: @org/name</h4>
    <p>The scope is a namespace you own. The package name is then @yourorg/thing, which removes typosquatting risk entirely for your internal packages, and makes ownership obvious.</p>
    <div class="codeWrap"><pre><code>
// npm scopes: @org/name
npm login --scope=@yourorg
npm publish --access public
// a private scope is free and unlimited on the free tier
</code></pre></div>

    <h4 id="ch2-scopes-maven">Maven group ids: com.yourorg.library</h4>
    <p>The groupId is a namespace, and the central repository requires you to verify ownership of a domain matching it. This is why "com.google.guava" exists and why a squat on com.yourorg is prevented by domain verification.</p>
    <div class="codeWrap"><pre><code>
// Maven group id: com.yourorg.library
//   central repository requires domain verification
</code></pre></div>

    <h4 id="ch2-scopes-pypi">PyPI: organisation accounts</h4>
    <p>Organisation accounts are free, and they own projects and their transfers. Use one for anything with more than one maintainer, and put a working email on it, because PyPI account recovery is email-based.</p>
    <div class="codeWrap"><pre><code>
// PyPI organisation account: free, owns projects and transfers
</code></pre></div>

    <h4 id="ch2-scopes-reserve">Reserve crate names on crates.io</h4>
    <p>A verified GitHub organisation or domain can reserve a crate name without publishing, so nobody takes it. Do this for every name you might ever use.</p>
    <div class="codeWrap"><pre><code>
// crates.io: reserve a name without publishing
//   reserve via verified organisation or domain
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-scopes"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-scopes done, new length: $($content.Length)"