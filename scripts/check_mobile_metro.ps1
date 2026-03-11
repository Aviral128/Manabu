$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$mobileRoot = Join-Path $root "mobile_app"
$cmdPath = Join-Path $env:SystemRoot "System32\\cmd.exe"
$powerShellPath = Join-Path $env:SystemRoot "System32\\WindowsPowerShell\\v1.0\\powershell.exe"
$netstatPath = Join-Path $env:SystemRoot "System32\\netstat.exe"
$findStrPath = Join-Path $env:SystemRoot "System32\\findstr.exe"

function Get-ListenerPid {
  param([int]$Port)

  $lines = & $cmdPath /c "`"$netstatPath`" -ano | `"$findStrPath`" :$Port"
  foreach ($line in $lines) {
    if ($line -match "LISTENING\s+(\d+)$") {
      return [int]$Matches[1]
    }
  }

  return $null
}

function Wait-Status {
  param(
    [string]$Url,
    [int]$TimeoutSec = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    try {
      $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
      if ($resp.StatusCode -eq 200) {
        if ($resp.Content -is [byte[]]) {
          return [System.Text.Encoding]::UTF8.GetString($resp.Content)
        }

        $text = [string]$resp.Content
        if ($text -match "^\d+( \d+)+$") {
          $bytes = $text.Split(" ") | ForEach-Object { [byte]$_ }
          return [System.Text.Encoding]::UTF8.GetString($bytes)
        }

        return $text
      }
    } catch {
      Start-Sleep -Milliseconds 750
    }
  } while ((Get-Date) -lt $deadline)

  return $null
}

$managed = $false
$port = 8081
$statusUrl = "http://127.0.0.1:$port/status"
$bundleUrl = "http://127.0.0.1:$port/index.bundle?platform=android&dev=true&minify=false"

try {
  if (-not (Get-ListenerPid -Port $port)) {
    $null = Start-Process -FilePath $powerShellPath -ArgumentList "-NoLogo", "-NoProfile", "-Command", "Set-Location '$mobileRoot'; npm run start -- --port $port" -WindowStyle Hidden
    $managed = $true
  } else {
    Write-Output "REUSE`tmobile-metro`tport $port"
  }

  $content = Wait-Status -Url $statusUrl
  if ($content) {
    $bundle = Wait-Status -Url $bundleUrl -TimeoutSec 90
    if ($bundle) {
      Write-Output "OK`tmobile-metro`t$content"
      Write-Output "OK`tmobile-bundle`tCompiled android bundle"
      exit 0
    }

    Write-Output "FAIL`tmobile-bundle`tTimed out waiting for Metro to compile the app bundle"
    exit 1
  }

  Write-Output "FAIL`tmobile-metro`tTimed out waiting for Metro status"
  exit 1
} finally {
if ($managed) {
    $listenerPid = Get-ListenerPid -Port $port
    if ($listenerPid) {
      Stop-Process -Id $listenerPid -Force -ErrorAction SilentlyContinue
    }
  }
}
