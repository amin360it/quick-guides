$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch2-fat" data-toc>Minimising the published surface</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch2-fat at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch2-fat-files">The "files" field is authoritative</h4>
    <p>Without "files", npm uses .gitignore, and then everything you have ignored is published too. With "files", the list is authoritative. Always set it.</p>
    <div class="codeWrap"><pre><code>
// Always set the "files" field
"files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"]
</code></pre></div>

    <h4 id="ch2-fat-accidental">Files that always get in by accident</h4>
    <p>CI configuration (.github, .gitlab-ci.yml, Jenkinsfile), Dockerfiles, compose files, test fixtures, editor directories (.idea, .vscode), and .env files often ship by accident. Check specifically for .env files.</p>
    <div class="codeWrap"><pre><code>
// Common files that accidentally ship
//   - CI configuration: .github, .gitlab-ci.yml, Jenkinsfile
//   - Dockerfiles and compose files
//   - test fixtures, often large
//   - editor directories: .idea, .vscode
//   - .env files. Check for this specifically.
</code></pre></div>

    <h4 id="ch2-fat-budget">Size budget in CI</h4>
    <p>Set a budget and fail the build if the artefact grows by more than a set percentage. A package that grows 10 MB in a release is usually a mistake, and it is invisible without this check.</p>
    <div class="codeWrap"><pre><code>
// Verify the size in CI
$ npm pack --dry-run
npm notice package size: 1.2 MB
npm notice unpacked size: 4.8 MB
// set a budget and fail the build if it is exceeded
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch2-fat"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch2-fat done, new length: $($content.Length)"