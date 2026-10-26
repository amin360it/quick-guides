$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = 'C:\Users\user\repo\learn-software-engineering'
$brand = Join-Path $root 'assets\brand'
if (-not (Test-Path $brand)) { New-Item -ItemType Directory -Path $brand | Out-Null }

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

function Save-Bmp($bmp, $path) {
  if (Test-Path $path) { Remove-Item $path -Force }
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Jpeg($bmp, $path, $quality) {
  if (Test-Path $path) { Remove-Item $path -Force }
  $enc = [System.Drawing.Imaging.Encoder]::Quality
  $ps = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($enc, [long]$quality)
  $bmp.Save($path, $jpegCodec, $ps)
}

function Get-Scaled($src, $newW, $newH) {
  $dst = [System.Drawing.Bitmap]::new([int]$newW, [int]$newH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, 0, 0, [int]$newW, [int]$newH)
  $g.Dispose()
  return $dst
}

# ---------------------------------------------------------------- logo
# Trim the transparent margin so the visible mark fills the frame, then scale
# down. 1024px of transparent padding is most of the file.
$src = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'amin360it-logo.png'))
$minX = $src.Width; $maxX = -1; $minY = $src.Height; $maxY = -1
for ($y = 0; $y -lt $src.Height; $y += 2) {
  for ($x = 0; $x -lt $src.Width; $x += 2) {
    if ($src.GetPixel($x, $y).A -gt 8) {
      if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$src.Dispose()
"logo content box: {0},{1}  to  {2},{3}  ({4}x{5})" -f $minX, $minY, $maxX, $maxY, ($maxX-$minX+1), ($maxY-$minY+1)

$pad = 6
$cw = $maxX - $minX + 1 + ($pad * 2)
$ch = $maxY - $minY + 1 + ($pad * 2)
$full = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'amin360it-logo.png'))
$rect = [System.Drawing.Rectangle]::new([int]($minX - $pad), [int]($minY - $pad), [int]$cw, [int]$ch)
$trimmed = $full.Clone($rect, $full.PixelFormat)
$full.Dispose()

# 160px tall keeps the header mark crisp on a 2x display at 36px, and small.
$scale = 160.0 / $ch
$logoOut = Get-Scaled $trimmed ([int]($cw * $scale)) 160
Save-Bmp $logoOut (Join-Path $brand 'logo.png')
"wrote assets/brand/logo.png  {0}x{1}" -f $logoOut.Width, $logoOut.Height
$logoOut.Dispose(); $trimmed.Dispose()

# ---------------------------------------------------------------- hero background
# The source is 1672x941 PNG at 1.6 MB. As a JPEG at 82% it is visually
# identical for a smooth gradient and roughly a tenth of the weight.
$bgSrc = [System.Drawing.Bitmap]::FromFile((Join-Path $root 'Amin360iT BG (2).png'))
$heroW = 1500
$heroH = [int]($bgSrc.Height * ($heroW / [double]$bgSrc.Width))
$hero = Get-Scaled $bgSrc $heroW $heroH
Save-Jpeg $hero (Join-Path $brand 'hero.jpg') 82
"wrote assets/brand/hero.jpg  {0}x{1}" -f $hero.Width, $hero.Height
$hero.Dispose(); $bgSrc.Dispose()

Write-Output ''
Write-Output '--- results ---'
Get-ChildItem $brand | ForEach-Object {
  "{0,-16} {1,8:N0} KB" -f $_.Name, ($_.Length / 1KB)
}
$orig = (Get-Item (Join-Path $root 'Amin360iT BG (2).png')).Length + (Get-Item (Join-Path $root 'amin360it-logo.png')).Length
$now = (Get-ChildItem $brand | Measure-Object -Property Length -Sum).Sum
"originals {0:N0} KB  ->  optimised {1:N0} KB" -f ($orig / 1KB), ($now / 1KB)