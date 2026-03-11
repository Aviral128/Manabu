$ErrorActionPreference = 'Continue'
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidsPath = Join-Path $root '.local\processes.json'

if (-not (Test-Path $pidsPath)) {
  Write-Output 'No running stack record found.'
  exit 0
}

$items = Get-Content $pidsPath | ConvertFrom-Json
foreach ($item in $items) {
  try {
    Stop-Process -Id $item.pid -Force -ErrorAction Stop
    Write-Output "Stopped`t$($item.name)`tPID=$($item.pid)"
  } catch {
    Write-Output "Skip`t$($item.name)`tPID=$($item.pid)"
  }
}

Remove-Item $pidsPath -Force -ErrorAction SilentlyContinue
Write-Output 'Local stack stopped.'
