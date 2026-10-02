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
	throw "Steam library source image was not found: $sourcePath"
}
if (-not (Test-Path -LiteralPath $fontPath -PathType Leaf)) {
	throw "Steam library capsule font was not found: $fontPath"
}
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null

Add-Type -AssemblyName System.Drawing
$fontCollection = [System.Drawing.Text.PrivateFontCollection]::new()
$fontCollection.AddFontFile($fontPath)
$fontFamily = $fontCollection.Families[0]
$source = [System.Drawing.Image]::FromFile($sourcePath)

function Get-CenteredCrop([int] $Width, [int] $Height) {
	$sourceRatio = $source.Width / [double] $source.Height
	$targetRatio = $Width / [double] $Height
	if ($sourceRatio -gt $targetRatio) {
		$cropWidth = [int] [Math]::Round($source.Height * $targetRatio)
		return [System.Drawing.Rectangle]::new([int] (($source.Width - $cropWidth) / 2), 0, $cropWidth, $source.Height)
	}
	$cropHeight = [int] [Math]::Round($source.Width / $targetRatio)
	$cropY = [int] (($source.Height - $cropHeight) / 2)
	return [System.Drawing.Rectangle]::new(0, $cropY, $source.Width, $cropHeight)
}

function Write-LibraryImage([string] $Name, [int] $Width, [int] $Height, [bool] $AddTitle) {
	$targetPath = Join-Path $outputPath $Name
	$bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
	$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
	$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
	$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
	$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
	$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
	$sourceRect = Get-CenteredCrop $Width $Height
	try {
		$graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $Width, $Height), $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
		if ($AddTitle) {
			$font = [System.Drawing.Font]::new($fontFamily, 39, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
			$format = [System.Drawing.StringFormat]::GenericTypographic
			$format.FormatFlags = $format.FormatFlags -bor [System.Drawing.StringFormatFlags]::NoWrap
			$shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(200, 3, 14, 23))
			$ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 242, 216))
			try {
				$graphics.DrawString('FISHING FREE', $font, $shadow, 32, 52, $format)
				$graphics.DrawString('FISHING FREE', $font, $ink, 30, 49, $format)
			} finally {
				$shadow.Dispose()
				$ink.Dispose()
				$font.Dispose()
				$format.Dispose()
			}
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
	Write-LibraryImage 'library-capsule-600x900.png' 600 900 $true
	Write-LibraryImage 'library-hero-3840x1240.png' 3840 1240 $false
} finally {
	$source.Dispose()
	$fontCollection.Dispose()
}
