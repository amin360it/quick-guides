$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-typosquat" data-toc>Name collisions and typosquatting</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-typosquat at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-typosq-lockfiles">Lockfiles pin integrity hashes</h4>
    <p>A lockfile pins the integrity hash of every dependency, so a typosquatted package cannot be swapped in without a lockfile change you would see in review. Always commit your lockfile for applications.</p>
    <div class="codeWrap"><pre><code>
// Example: npm ls resolved hashes
$ npm ls --all --json | jq -r '
    .dependencies | to_entries[] |
    "\(.value.resolved // "none")  \(.key)"' \
  | awk '{print $1}' | sed 's|https://registry.npmjs.org/||' \
  | grep -v '^none$' | sort -u | head
</code></pre></div>

    <h4 id="ch2-typosq-scope">Scopes and namespace namespaces</h4>
    <p>A scope (npm) or group ID (Maven) is a registered namespace, making typosquatting much harder. Use scoped packages for anything with more than one maintainer.</p>
    <div class="codeWrap"><pre><code>
// npm scope: @yourorg/name
npm login --scope=@yourorg
npm publish --access public

// Maven groupId: com.yourorg.library
//   central repository requires domain verification
</code></pre></div>

    <h4 id="ch2-typosq-ci-check">CI step to detect typosquatting</h4>
    <p>Resolve every dependency and fail if any comes from an unexpected registry. Test by pointing one dependency at a URL you do not expect.</p>
    <div class="codeWrap"><pre><code>
// CI step to detect typosquatting
$ npm ls --all --json | jq -r '
    .dependencies | to_entries[] |
    "\(.value.resolved // "none")  \(.key)"' \
  | awk '{print $1}' | sed 's|https://registry.npmjs.org/||' \
  | grep -v '^none$' | sort -u | head
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-typosquat"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-typosquat done, new length: $($content.Length)"