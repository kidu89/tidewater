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
	[string] $SteamCmdPath,
	[string] $SteamUsername,

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

$resolvedSteamCmdPath = $null
if ($Upload) {
	if ([string]::IsNullOrWhiteSpace($SteamCmdPath)) {
		throw '-Upload requires -SteamCmdPath pointing to steamcmd.exe.'
	}
	if ([string]::IsNullOrWhiteSpace($SteamUsername)) {
		throw '-Upload requires -SteamUsername. The password and Steam Guard code must never be passed to this script.'
	}

	if (-not [System.IO.Path]::IsPathRooted($SteamCmdPath)) {
		$SteamCmdPath = Join-Path $repositoryRoot $SteamCmdPath
	}
	if (-not (Test-Path -LiteralPath $SteamCmdPath -PathType Leaf)) {
		throw "SteamCMD was not found at: $SteamCmdPath"
	}
	$resolvedSteamCmdPath = (Resolve-Path -LiteralPath $SteamCmdPath).Path

	$steamCmdConfig = Join-Path (Split-Path -Parent $resolvedSteamCmdPath) 'config\config.vdf'
	if (-not (Test-Path -LiteralPath $steamCmdConfig -PathType Leaf)) {
		throw "SteamCMD has no cached login configuration at '$steamCmdConfig'. Run SteamCMD interactively, complete sign-in and Steam Guard, then keep its config folder on this upload machine."
	}
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
[System.IO.File]::WriteAllText($appBuildPath, $appBuild.Trim() + [Environment]::NewLine, $utf8WithoutBom)
[System.IO.File]::WriteAllText($depotBuildPath, $depotBuild.Trim() + [Environment]::NewLine, $utf8WithoutBom)

Write-Output "Created $appBuildPath"
Write-Output "Created $depotBuildPath"

if (-not $Upload) {
	Write-Output 'SteamPipe mode: PREVIEW ONLY. SteamCMD was not started and no content was uploaded.'
	Write-Output 'SetLive is empty; this preview does not assign a build to a live branch.'
	return
}

$steamCmdLogPath = Join-Path $OutputDirectory 'steamcmd-upload.log'
Write-Output "Starting SteamCMD upload for app $AppId using the cached login for '$SteamUsername'."
Write-Output 'The uploaded build will not be assigned to a live branch; SetLive is empty.'

$manifestStateBefore = @{}
$existingManifests = Get-ChildItem -LiteralPath $buildOutput -Filter '*.manifest' -File -Recurse -ErrorAction SilentlyContinue
foreach ($manifest in $existingManifests) {
	$manifestStateBefore[$manifest.FullName] = "$($manifest.LastWriteTimeUtc.Ticks)|$($manifest.Length)"
}

Push-Location -LiteralPath $OutputDirectory
try {
	& $resolvedSteamCmdPath '+login' $SteamUsername '+run_app_build' (Split-Path -Leaf $appBuildPath) '+quit' 2>&1 |
		Tee-Object -FilePath $steamCmdLogPath
	$steamCmdExitCode = $LASTEXITCODE
} finally {
	Pop-Location
}
if ($steamCmdExitCode -ne 0) {
	throw "SteamCMD exited with code $steamCmdExitCode. Review its output at '$steamCmdLogPath'."
}

$recentManifests = @(
	Get-ChildItem -LiteralPath $buildOutput -Filter '*.manifest' -File -Recurse -ErrorAction SilentlyContinue |
		Where-Object {
			$currentState = "$($_.LastWriteTimeUtc.Ticks)|$($_.Length)"
			-not $manifestStateBefore.ContainsKey($_.FullName) -or $manifestStateBefore[$_.FullName] -ne $currentState
		}
)
if ($recentManifests.Count -eq 0) {
	throw "SteamCMD exited with code 0 but did not create a fresh depot manifest. Review '$steamCmdLogPath' and the Steamworks build history; upload success is not confirmed."
}

Write-Output "SteamCMD exited with code 0 and created $($recentManifests.Count) fresh depot manifest(s)."
Write-Output "Review '$steamCmdLogPath' and the Steamworks build history to confirm the server accepted the upload."
Write-Output 'The uploaded build remains unassigned to a live branch until you explicitly set it live in Steamworks.'
