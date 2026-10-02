param(
	[string] $InputPath = 'docs/steam-assets-draft-v2/source-concept.png',
	[string] $OutputDirectory = 'docs/steam-assets-draft-v2'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourcePath = Join-Path $repoRoot $InputPath
$outputPath = Join-Path $repoRoot $OutputDirectory
$fontPath = Join-Path $repoRoot 'tools/props/fonts/Oswald.ttf'

if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
	throw "Steam capsule source image was not found: $sourcePath"
}
if (-not (Test-Path -LiteralPath $fontPath -PathType Leaf)) {
	throw "Steam capsule font was not found: $fontPath"
}
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

Add-Type -AssemblyName System.Drawing
$fontCollection = [System.Drawing.Text.PrivateFontCollection]::new()
$fontCollection.AddFontFile($fontPath)
$fontFamily = $fontCollection.Families[0]
$source = [System.Drawing.Image]::FromFile($sourcePath)

function Write-Capsule([string] $Name, [int] $Width, [int] $Height, [float] $FontSize, [float] $TopFraction) {
	$targetPath = Join-Path $outputPath $Name
	$bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
	$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
	$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
	$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
	$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
	$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

	$sourceRatio = $source.Width / [double] $source.Height
	$targetRatio = $Width / [double] $Height
	if ($sourceRatio -gt $targetRatio) {
		$cropWidth = [int] [Math]::Round($source.Height * $targetRatio)
		$sourceRect = [System.Drawing.Rectangle]::new([int] (($source.Width - $cropWidth) / 2), 0, $cropWidth, $source.Height)
	} else {
		$cropHeight = [int] [Math]::Round($source.Width / $targetRatio)
		$cropY = [int] (($source.Height - $cropHeight) / 2)
		$sourceRect = [System.Drawing.Rectangle]::new(0, $cropY, $source.Width, $cropHeight)
	}

	try {
		$graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $Width, $Height), $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
		$font = [System.Drawing.Font]::new($fontFamily, $FontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
		$format = [System.Drawing.StringFormat]::GenericTypographic
		$format.FormatFlags = $format.FormatFlags -bor [System.Drawing.StringFormatFlags]::NoWrap
		$marginX = [float] ($Width * 0.055)
		$marginY = [float] ($Height * $TopFraction)
		$title = 'FISHING FREE'
		$shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(175, 3, 14, 23))
		$ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 242, 216))
		try {
			$graphics.DrawString($title, $font, $shadow, $marginX + 2, $marginY + 3, $format)
			$graphics.DrawString($title, $font, $ink, $marginX, $marginY, $format)
		} finally {
			$shadow.Dispose()
			$ink.Dispose()
			$font.Dispose()
			$format.Dispose()
		}
		$bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
		$info = Get-Item -LiteralPath $targetPath
		[PSCustomObject]@{ Path = $info.FullName; Width = $Width; Height = $Height; Bytes = $info.Length }
	} finally {
		$graphics.Dispose()
		$bitmap.Dispose()
	}
}

try {
	Write-Capsule 'main-1232x706.png' 1232 706 78 0.065
	Write-Capsule 'header-920x430.png' 920 430 56 0.075
	Write-Capsule 'small-462x174.png' 462 174 27 0.09
} finally {
	$source.Dispose()
	$fontCollection.Dispose()
}
