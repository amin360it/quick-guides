$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-ci" data-toc>Building in CI and only in CI</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-ci at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-ci-cicd-pipeline">CI pipeline shape</h4>
    <p>A release pipeline triggered by git tags is the standard pattern. It combines signed annotated tags, protected tag patterns, and short-lived OIDC credentials so a stolen laptop token cannot publish.</p>
    <div class="codeWrap"><pre><code>
// Git tag-triggered release pipeline
git tag -s -m "v1.2.3" 1.2.3
git push origin v1.2.3
</code></pre></div>

    <h4 id="ch2-ci-protections">Four rules for safe publishing</h4>
    <p>1. BUILD IN CI. Never publish from a laptop. Ever. 2. PROTECT THE TAG. Require signed tags and a protected release environment with reviewers. 3. USE SHORT-LIVED CREDENTIALS. OIDC exchange means no long-lived secret to steal. 4. VERIFY BEFORE PUBLISH. Check the artefact with a test, not confidence.</p>
    <div class="codeWrap"><pre><code>
// THE FOUR RULES
//   1. BUILD IN CI. Never publish from a laptop. Ever.
//   2. PROTECT THE TAG. Require signed tags and a protected release environment with reviewers
//   3. USE SHORT-LIVED CREDENTIALS. OIDC exchange means no long-lived secret.
//   4. VERIFY BEFORE PUBLISH. The artefact you ship is checked by a test.
</code></pre></div>

    <h4 id="ch2-ci-tag-trigger">Tag-triggered release pattern</h4>
    <p>The tag is the immutable statement of intent. Combine with: signed annotated tags, and a protected tag pattern in the repository settings.</p>
    <div class="codeWrap"><pre><code>
// Standard tag-triggered pipeline
git tag -s -m "v1.2.3" 1.2.3
git push origin v1.2.3
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-ci"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-ci done, new length: $($content.Length)"