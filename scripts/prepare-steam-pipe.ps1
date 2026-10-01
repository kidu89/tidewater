[CmdletBinding()]
param (
	[Parameter(Mandatory = $true)]
	[ValidatePattern('^\d+$')]
	[string] $AppId,

	[Parameter(Mandatory = $true)]
	[ValidatePattern('^\d+$')]
	[string] $DepotId,

	[string] $ContentRoot,
	[string] $OutputDirectory,
	[string] $BuildDescription,

	[switch] $Upload
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if ([string]::IsNullOrWhiteSpace($ContentRoot)) {
	$ContentRoot = Join-Path $repositoryRoot 'release\win-unpacked'
} elseif (-not [System.IO.Path]::IsPathRooted($ContentRoot)) {
	$ContentRoot = Join-Path $repositoryRoot $ContentRoot
}

$ContentRoot = (Resolve-Path -LiteralPath $ContentRoot).Path
$gameExecutable = Join-Path $ContentRoot 'Fishing Free.exe'
if (-not (Test-Path -LiteralPath $gameExecutable -PathType Leaf)) {
	throw "The Steam depot content root does not contain 'Fishing Free.exe': $ContentRoot"
}

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
	$OutputDirectory = Join-Path $repositoryRoot 'steamworks\generated'
} elseif (-not [System.IO.Path]::IsPathRooted($OutputDirectory)) {
	$OutputDirectory = Join-Path $repositoryRoot $OutputDirectory
}

$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
$buildOutput = Join-Path $OutputDirectory 'build-output'
$null = New-Item -ItemType Directory -Path $OutputDirectory -Force
$null = New-Item -ItemType Directory -Path $buildOutput -Force

if ([string]::IsNullOrWhiteSpace($BuildDescription)) {
	$BuildDescription = 'Fishing Free Windows x64 build ' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss') + ' UTC'
}

function ConvertTo-VdfValue([string] $Value) {
	$cleanValue = $Value -replace '[\r\n\t]+', ' '
	$cleanValue = $cleanValue -replace '\\', '/'
	$cleanValue = $cleanValue -replace '"', '\"'
	return $cleanValue
}

$vdfContentRoot = ConvertTo-VdfValue $ContentRoot
$vdfBuildOutput = ConvertTo-VdfValue $buildOutput
$vdfDescription = ConvertTo-VdfValue $BuildDescription
$preview = if ($Upload) { '0' } else { '1' }
$appBuildPath = Join-Path $OutputDirectory "app_build_$AppId.vdf"
$depotBuildPath = Join-Path $OutputDirectory "depot_build_$DepotId.vdf"

$appBuild = @"
"AppBuild"
{
	"AppID"		"$AppId"
	"Desc"		"$vdfDescription"
	"Preview"	"$preview"
	"SetLive"	""
	"ContentRoot"	"$vdfContentRoot"
	"BuildOutput"	"$vdfBuildOutput"
	"Depots"
	{
		"$DepotId"	"depot_build_$DepotId.vdf"
	}
}
"@

$depotBuild = @"
"DepotBuild"
{
	"DepotID"	"$DepotId"
	"FileMapping"
	{
		"LocalPath"	"*"
		"DepotPath"	"."
		"Recursive"	"1"
	}
	"FileExclusion"	"*.pdb"
}
"@

$utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($appBuildPath, $appBuild.Trim() + "`n", $utf8WithoutBom)
[System.IO.File]::WriteAllText($depotBuildPath, $depotBuild.Trim() + "`n", $utf8WithoutBom)

$buildMode = if ($Upload) { 'upload enabled' } else { 'preview only (no upload)' }
Write-Output "Created $appBuildPath"
Write-Output "Created $depotBuildPath"
Write-Output "SteamPipe mode: $buildMode. SetLive is empty; this does not publish a build to a branch."
