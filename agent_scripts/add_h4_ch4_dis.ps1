$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-dist" data-toc>dist-tags, versions and the release dance</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-dist at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-dist-disttags">dist-tags are mutable pointers</h4>
    <p>dist-tags like "latest" are mutable pointers that can be repointed after publish. The default tag is "latest". Use --tag beta for pre-releases and --tag lts for long-term support.</p>
    <div class="codeWrap"><pre><code>
// dist-tags are mutable pointers
$ npm dist-tag ls @yourorg/core
latest: 1.4.2
next:   2.0.0-beta.3
lts:    1.3.9

$ npm install @yourorg/core            // resolves "latest" → 1.4.2
$ npm install @yourorg/core@next       // 2.0.0-beta.3
$ npm install @yourorg/core@1.3.9      // pinned, by version
</code></pre></div>

    <h4 id="ch4-dist-beta">Beta release pattern</h4>
    <p>The proper beta release uses --tag beta. Without it, the beta becomes "latest" and every user gets it. Always add a CI check.</p>
    <div class="codeWrap"><pre><code>
// Beta release, done properly
$ npm version prerelease --preid=beta   # 1.4.2 → 1.4.3-beta.0
$ npm publish --tag beta                // note --tag. Without it, beta becomes "latest"
$ npm dist-tag add @yourorg/core@1.4.2 latest   // put latest back
</code></pre></div>

    <h4 id="ch4-dist-failure">The failure that happens every year</h4>
    <p>Someone runs npm publish on a prerelease version without --tag beta, and for a few hours every npm install in the world gets the beta. A CI check is the fix.</p>
    <div class="codeWrap"><pre><code>
// CI check to prevent the failure
$ if [[ "$TAG" == *-* ]] && [ "${PUBLISH_TAG}" != "beta" ]; then
    echo "prerelease published without --tag beta"; exit 1
  fi
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-dist"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-dist done, new length: $($content.Length)"