$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-deps" data-toc>Dependencies and peer dependencies</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-deps at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-deps-dependencies">dependencies field</h4>
    <p>"dependencies" are installed with your package and required for it to work. They are brought in as transitive dependencies and must be satisfied for your package to function.</p>
    <div class="codeWrap"><pre><code>
// dependencies: required at runtime
"dependencies": {
  "react": "^18.0.0 || ^19.0.0"
}
</code></pre></div>

    <h4 id="ch4-deps-devdependencies">devDependencies field</h4>
    <p>"devDependencies" are not installed for consumers; they are for you only. They are pinned by the lockfile, not the range. Do not write "*".</p>
    <div class="codeWrap"><pre><code>
// devDependencies: not for consumers
"devDependencies": {
  "typescript": "^5.4.0"      // caret in devDeps is correct
}
</code></pre></div>

    <h4 id="ch4-peerdependencies">peerDependencies field</h4>
    <p>"peerDependencies" are NOT installed. The consumer provides them. This matters when the host application and your package must share ONE instance, e.g. a React component library bundling React.</p>
    <div class="codeWrap"><pre><code>
// peerDependencies: consumer provides
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
},
"peerDependenciesMeta": {
  "react-dom": { "optional": true }
}
</code></pre></div>

    <h4 id="ch4-optionaldependencies">optionalDependencies field</h4>
    <p>"optionalDependencies" are installed if available, failure is tolerated. They are useful for optional native bindings or features that may not be available on all platforms.</p>
    <div class="codeWrap"><pre><code>
// optionalDependencies: installed if available, failure tolerated
"optionalDependencies": {
  "sharp": "^0.32.0"
}
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-deps"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-deps done, new length: $($content.Length)"