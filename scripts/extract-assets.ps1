$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "$PSScriptRoot/../design.png").Path
$mapSourcePath = (Resolve-Path "$PSScriptRoot/../design/img-assets/newmap3_orig.jpg").Path
$outputDir = Join-Path $PSScriptRoot '../public/images'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$source = [System.Drawing.Bitmap]::FromFile($sourcePath)

$crops = @(
  @{ Name = 'stay-cabin.png'; X = 59; Y = 581; W = 239; H = 165 },
  @{ Name = 'stay-rv.png'; X = 312; Y = 581; W = 239; H = 165 },
  @{ Name = 'stay-tent.png'; X = 565; Y = 581; W = 239; H = 165 },
  @{ Name = 'event-forest.png'; X = 59; Y = 905; W = 179; H = 110 },
  @{ Name = 'event-lake.png'; X = 247; Y = 905; W = 179; H = 110 },
  @{ Name = 'event-lights.png'; X = 436; Y = 905; W = 177; H = 110 },
  @{ Name = 'event-flowers.png'; X = 623; Y = 905; W = 178; H = 110 },
  @{ Name = 'gallery-aerial.png'; X = 29; Y = 1392; W = 164; H = 132 },
  @{ Name = 'gallery-pool.png'; X = 198; Y = 1392; W = 163; H = 132 },
  @{ Name = 'gallery-sign.png'; X = 366; Y = 1392; W = 162; H = 132 },
  @{ Name = 'gallery-cabin.png'; X = 533; Y = 1392; W = 149; H = 132 },
  @{ Name = 'gallery-path.png'; X = 687; Y = 1392; W = 152; H = 132 },
  @{ Name = 'story.png'; X = 618; Y = 1561; W = 194; H = 140 }
)

foreach ($crop in $crops) {
  $rect = [System.Drawing.Rectangle]::new($crop.X, $crop.Y, $crop.W, $crop.H)
  $bitmap = $source.Clone($rect, $source.PixelFormat)
  $target = Join-Path $outputDir $crop.Name
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$source.Dispose()

Copy-Item -LiteralPath $mapSourcePath -Destination (Join-Path $outputDir 'resort-map.jpg') -Force
