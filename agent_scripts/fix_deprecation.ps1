$file = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
$content = Get-Content -Path $file -Raw

# Find positions
$h4Tag = '<h4 id="ch1-deprecation-mechanics">Deprecation mechanics per language</h4>'
$pos1 = $content.IndexOf($h4Tag)  # First occurrence at ~line 953
$pos2 = $content.IndexOf($h4Tag, $pos1 + 1)  # Second occurrence at ~line 1037
$goodPos = $content.IndexOf('// DEPRECATION, the lifecycle of a version')  # Good content starts here

Write-Host "First h4 at: $pos1"
Write-Host "Second h4 at: $pos2"
Write-Host "Good content at: $goodPos"

# Step 1: Remove the duplicate block (from second h4 to before good content)
if ($pos2 -ge 0 -and $goodPos -gt $pos2) {
    $blockLen = $goodPos - $pos2
    Write-Host "Removing block of length $blockLen from position $pos2"
    $content = $content.Remove($pos2, $blockLen)
    Write-Host "Removal complete. New content length: $($content.Length)"
}

# Step 2: Add the h3 section before the first h4
$h3Tag = '<h3 id="ch1-deprecation" data-toc>Deprecating and yanking</h3>'
$h4InsertPos = $content.IndexOf($h4Tag)  # First h4 position (now may have shifted after removal)
Write-Host "First h4 position after removal: $h4InsertPos"

if ($h4InsertPos -ge 0) {
    # Insert the h3 before the first h4
    $content = $content.Insert($h4InsertPos, $h3Tag)
    Write-Host "h3 inserted at position $h4InsertPos"
}

# Write the modified content back using Out-File
$outFile = 'C:\Users\user\repo\learn-software-engineering\package-publishing.html'
[System.IO.File]::WriteAllText($outFile, $content)
Write-Host "Modified content written to $outFile"
Write-Host "New content length: $($content.Length)"
# Find the h3 tag position in new content
$newPos = $content.IndexOf($h3Tag)
Write-Host "h3 tag position in new content: $newPos"