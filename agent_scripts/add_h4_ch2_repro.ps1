$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

# Find the ch2-reproducible h3 position
$h3Tag = '<h3 id="ch2-reproducible" data-toc>Reproducible builds</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "h3 position: $h3Pos"

if ($h3Pos -ge 0) {
    # Find the codeWrap opening after the h3
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap position: $cwPos"
    
    if ($cwPos -ge 0) {
        # Insert 3 h4s between the h3 and the codeWrap
        $h4s = @"
    <h4 id="ch2-repro-determinism">Determinism vs Reproducibility</h4>
    <p>Reproducibility is stronger than determinism: same input, same output on <em>any</em> machine. Determinism only guarantees same output on the <em>same</em> machine. This distinction matters for binary artefacts and supply-chain audits.</p>
    <div class="codeWrap"><pre><code>
// Reproducible: same input, same output, on ANY machine
// Deterministic: same input, same output, on the SAME machine only
// Reproducibility implies determinism, not the reverse
</code></pre></div>

    <h4 id="ch2-repro-timestamps">Timestamps and File Order</h4>
    <p>The single most common cause of non-reproducibility is baked-in timestamps. Normalise mtime during archiving: <code>tar --sort=name --mtime='UTC 2020-01-01'</code>. Sort directory listings explicitly with <code>find . -type f | sort</code>.</p>
    <div class="codeWrap"><pre><code>
// Fix timestamps in a tar archive
tar --sort=name --mtime='UTC 2020-01-01' \
    --owner=0 --group=0 \
    --numeric-owner -cf dist.tar build/

// Sort file lists explicitly
find . -type f | sort | xargs tar --sort=name -cf archive.tar
</code></pre></div>

    <h4 id="ch2-repro-verify">Verify with Hash Comparison</h4>
    <p>Build twice in clean containers on different runners and compare hashes. This five-minute CI step catches timestamps, file ordering, and dependency non-determinism.</p>
    <div class="codeWrap"><pre><code>
// Verify reproducibility in CI
$ sha256sum dist/myapp-1.2.3.tar.gz
a3f5c9...  dist/myapp-1.2.3.tar.gz
// build again on a different machine, in a clean container
$ sha256sum dist/myapp-1.2.3.tar.gz
a3f5c9...  dist/myapp-1.2.3.tar.gz      must match
</code></pre></div>
"@

        # Insert the h4s before the codeWrap
        $insertPos = $cwPos
        $content = $content.Insert($insertPos, $h4s)
        Write-Host "Inserted h4s at position $insertPos"
    }
}

# Write the modified content back
[System.IO.File]::WriteAllText($file, $content)
Write-Host "File written successfully"