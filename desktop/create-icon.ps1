Add-Type -AssemblyName System.Drawing

$size = 512
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
	$path = New-Object System.Drawing.Drawing2D.GraphicsPath
	$diameter = $radius * 2
	$path.AddArc($x, $y, $diameter, $diameter, 180, 90)
	$path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
	$path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
	$path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
	$path.CloseFigure()
	return $path
}

function New-PolygonPath([System.Drawing.PointF[]]$points) {
	$path = New-Object System.Drawing.Drawing2D.GraphicsPath
	$path.AddPolygon($points)
	return $path
}

$bounds = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$canvasBackground = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
	$bounds,
	[System.Drawing.ColorTranslator]::FromHtml('#071b31'),
	[System.Drawing.ColorTranslator]::FromHtml('#0b4c5a'),
	52
)
$graphics.FillRectangle($canvasBackground, 0, 0, $size, $size)
$tile = New-RoundedPath 16 16 480 480 112
$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
	$bounds,
	[System.Drawing.ColorTranslator]::FromHtml('#09233d'),
	[System.Drawing.ColorTranslator]::FromHtml('#0d7679'),
	52
)
$graphics.FillPath($background, $tile)

$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(114, 45, 360, 300)
$glow = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glow.CenterColor = [System.Drawing.Color]::FromArgb(54, 89, 214, 199)
$glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 89, 214, 199))
$graphics.FillPath($glow, $glowPath)

$sun = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
	(New-Object System.Drawing.Rectangle(330, 89, 62, 62)),
	[System.Drawing.ColorTranslator]::FromHtml('#ffe6b5'),
	[System.Drawing.ColorTranslator]::FromHtml('#f3a85f'),
	90
)
$graphics.FillEllipse($sun, 330, 89, 62, 62)

$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210, 227, 245, 225), 5)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawBezier($linePen, 78, 106, 93, 188, 118, 195, 171, 215)

$fishColor = [System.Drawing.ColorTranslator]::FromHtml('#ffd28f')
$fishShadow = [System.Drawing.Color]::FromArgb(70, 2, 22, 35)
$tail = New-PolygonPath @(
	(New-Object System.Drawing.PointF(166, 264)),
	(New-Object System.Drawing.PointF(90, 204)),
	(New-Object System.Drawing.PointF(98, 264)),
	(New-Object System.Drawing.PointF(90, 324))
)
$body = New-Object System.Drawing.Drawing2D.GraphicsPath
$body.AddBezier(146, 264, 198, 183, 325, 174, 404, 263)
$body.AddBezier(404, 263, 327, 353, 201, 348, 146, 264)
$body.CloseFigure()
$fin = New-PolygonPath @(
	(New-Object System.Drawing.PointF(242, 211)),
	(New-Object System.Drawing.PointF(290, 141)),
	(New-Object System.Drawing.PointF(344, 211))
)
$pectoral = New-PolygonPath @(
	(New-Object System.Drawing.PointF(253, 279)),
	(New-Object System.Drawing.PointF(300, 329)),
	(New-Object System.Drawing.PointF(286, 270))
)

$shadowBrush = New-Object System.Drawing.SolidBrush($fishShadow)
$fishBrush = New-Object System.Drawing.SolidBrush($fishColor)
$graphics.TranslateTransform(0, 8)
$graphics.FillPath($shadowBrush, $tail)
$graphics.FillPath($shadowBrush, $fin)
$graphics.FillPath($shadowBrush, $body)
$graphics.FillPath($shadowBrush, $pectoral)
$graphics.ResetTransform()
$graphics.FillPath($fishBrush, $tail)
$graphics.FillPath($fishBrush, $fin)
$graphics.FillPath($fishBrush, $body)
$graphics.FillPath($fishBrush, $pectoral)

$gillPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(105, 67, 59, 52), 4)
$gillPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$gillPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawArc($gillPen, 239, 218, 58, 94, 275, 170)
$eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#15364a'))
$eyeHighlight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.FillEllipse($eyeBrush, 350, 246, 15, 15)
$graphics.FillEllipse($eyeHighlight, 354, 249, 4, 4)

$waveBack = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(115, 89, 221, 205), 13)
$waveFront = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(235, 106, 230, 208), 10)
foreach ($pen in @($waveBack, $waveFront)) {
	$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
	$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
}
$graphics.DrawBezier($waveBack, 68, 362, 157, 315, 228, 414, 326, 362)
$graphics.DrawBezier($waveBack, 256, 407, 323, 369, 377, 428, 447, 389)
$graphics.DrawBezier($waveFront, 71, 386, 153, 346, 224, 438, 310, 390)
$graphics.DrawBezier($waveFront, 264, 429, 324, 396, 381, 451, 444, 414)

$tileOutline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 221, 247, 235), 3)
$graphics.DrawPath($tileOutline, $tile)

$root = Split-Path $PSScriptRoot -Parent
$pngPath = Join-Path $PSScriptRoot 'icon.png'
$icoPath = Join-Path $PSScriptRoot 'icon.ico'
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

function Save-ScaledPng([System.Drawing.Bitmap]$source, [string]$path, [int]$targetSize) {
	$scaled = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
	$scaleGraphics = [System.Drawing.Graphics]::FromImage($scaled)
	$scaleGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
	$scaleGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
	$scaleGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
	$scaleGraphics.DrawImage($source, 0, 0, $targetSize, $targetSize)
	$scaled.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
	$scaleGraphics.Dispose()
	$scaled.Dispose()
}

$iosIcon = Join-Path $root 'ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png'
Save-ScaledPng $bitmap $iosIcon 1024

$androidRes = Join-Path $root 'android\app\src\main\res'
$densities = @(
	@{ Name = 'mipmap-mdpi'; Legacy = 48; Foreground = 108 },
	@{ Name = 'mipmap-hdpi'; Legacy = 72; Foreground = 162 },
	@{ Name = 'mipmap-xhdpi'; Legacy = 96; Foreground = 216 },
	@{ Name = 'mipmap-xxhdpi'; Legacy = 144; Foreground = 324 },
	@{ Name = 'mipmap-xxxhdpi'; Legacy = 192; Foreground = 432 }
)
foreach ($density in $densities) {
	$folder = Join-Path $androidRes $density.Name
	Save-ScaledPng $bitmap (Join-Path $folder 'ic_launcher.png') $density.Legacy
	Save-ScaledPng $bitmap (Join-Path $folder 'ic_launcher_round.png') $density.Legacy
	Save-ScaledPng $bitmap (Join-Path $folder 'ic_launcher_foreground.png') $density.Foreground
}

$graphics.Dispose()
$bitmap.Dispose()

$png = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]1)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]32)
$writer.Write([UInt32]$png.Length)
$writer.Write([UInt32]22)
$writer.Write($png)
$writer.Dispose()
$stream.Dispose()

Write-Output "Created $pngPath and $icoPath"
