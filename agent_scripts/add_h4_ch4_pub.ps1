$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-publish" data-toc>Publishing to npm</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-publish at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-publish-sequence">The publish sequence</h4>
    <p>The standard publish sequence: login, version bump, publish with provenance. Always run npm pack --dry-run first to read the file list.</p>
    <div class="codeWrap"><pre><code>
// Standard publish sequence
$ npm login                        # or use a token in CI
$ npm version patch                # 1.4.1 → 1.4.2, commits and tags
$ npm publish --provenance --access public

// A proper release, which is what you should actually do
$ npm ci
$ npm run build
$ npm test
$ npm pack --dry-run               // READ THE FILE LIST
</code></pre></div>

    <h4 id="ch4-publish-changelog">Changelog tooling</h4>
    <p>Run the changelot tooling to update CHANGELOG.md and package.json, then commit the release.</p>
    <div class="codeWrap"><pre><code>
// Changelot release tooling
$ npx changeset version            # updates CHANGELOG.md and package.json
$ npx changeset git                // commits the release
</code></pre></div>

    <h4 id="ch4-publish-two-package">Two-package pattern</h4>
    <p>npm couples packages only via the lockfile, so a patch release of @yourorg/core can be done without @yourorg/plugin. But git tags for a monorepo need the changesets flow.</p>
    <div class="codeWrap"><pre><code>
// Two-package pattern: core can be released independently
// But monorepo git tags need changesets flow (ch2-monorepo)
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-publish"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-publish done, new length: $($content.Length)"