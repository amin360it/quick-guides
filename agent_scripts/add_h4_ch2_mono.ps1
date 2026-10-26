$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-monorepo" data-toc>Monorepos and per-package releases</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-monorepo at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-mono-changesets">Changeset flow for independent releases</h4>
    <p>A changeset is a markdown file describing one change to one package. Tools like turbo or nx generate a release PR from accumulated changesets, computing versions from bump types. This is the most common modern answer to the monorepo release problem.</p>
    <div class="codeWrap"><pre><code>
// Changeset example
// packages/changesets/brave-lions-jump.md
//
// ---
// "@yourorg/core": minor
// "fix: handle a null token in refresh()"
// ---
// a release PR is generated from the accumulated changesets
</code></pre></div>

    <h4 id="ch2-mono-changelog">Per-package changelogs</h4>
    <p>A monorepo changelog is useless. Generate per-package changelogs from the changesets, and keep a root CHANGELOG that only records changes to the public workspace API.</p>
    <div class="codeWrap"><pre><code>
// Root CHANGELOG only records workspace API changes
// Per-package changelogs generated from changesets
</code></pre></div>

    <h4 id="ch2-mono-version-prop">Version propagation rules</h4>
    <p>If @yourorg/plugin requires @yourorg/core ^1.2.0 and core goes to 2.0.0, the plugin must be released too, and its new version must widen its range. Write the rule down because exception cases accumulate.</p>
    <div class="codeWrap"><pre><code>
// Version propagation: if core bumps, plugin range must widen
// Write the rule down because exception cases accumulate
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-monorepo"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-monorepo done, new length: $($content.Length)"