$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = [System.IO.File]::ReadAllText($file)

$h3Tag = '<h3 id="ch4-jsr" data-toc>JSR, and TypeScript-first packages</h3>'
$h3Pos = $content.IndexOf($h3Tag)

Write-Host "Processing ch4-jsr at position $h3Pos"

if ($h3Pos -ge 0) {
    $cwOpen = '<div class="codeWrap"><pre><code>'
    $cwPos = $content.IndexOf($cwOpen, $h3Pos)
    Write-Host "codeWrap at $cwPos"
    
    if ($cwPos -ge 0) {
        $h4s = @"
    <h4 id="ch4-jsr-types">Every exported symbol must have an explicit type</h4>
    <p>No inference on an exported function's return type, or the types are unavailable to consumers. All exported functions, classes, and interfaces must have type annotations.</p>
    <div class="codeWrap"><pre><code>
// Every exported symbol needs an explicit type
export async function retry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> { /* ... */ }

// Return type cannot be inferred and omitted
</code></pre></div>

    <h4 id="ch4-jsr-docjs">Document with JSDoc @param and @returns</h4>
    <p>Generated types and docs come from JSDoc that includes @param and @returns. No default exports in a library; use named exports.</p>
    <div class="codeWrap"><pre><code>
// Document with JSDoc including @param and @returns
/**
 * Retry an operation with exponential backoff.
 *
 * @param operation The operation to run. It should throw on failure.
 * @param options Retry configuration.
 * @returns The result of the first successful attempt.
 * @throws If every attempt fails.
 */
export async function retry(operation: () => Promise, options?: RetryOptions): Promise {
</code></pre></div>

    <h4 id="ch4-jsr-named-exports">No default exports</h4>
    <p>No default exports in a library; names collide across import styles. Use named exports only.</p>
    <div class="codeWrap"><pre><code>
// No default exports in a library
export { retry }
// never: default export
// never: module.exports = { retry }
</code></pre></div>
"@
        
        $content = $content.Insert($cwPos, $h4s)
        Write-Host "Inserted h4s for ch4-jsr"
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "ch4-jsr done, new length: $($content.Length)"