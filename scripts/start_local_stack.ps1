param(
  [switch]$SkipBuild,
  [switch]$IncludeAdmin,
  [switch]$IncludeUserWeb,
  [switch]$IncludeUI
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendRoot = Join-Path $root 'backend_services'
$backendApiRoot = Join-Path $root 'backend_api'
$adminRoot = Join-Path $root 'admin_panel'
$userWebRoot = Join-Path $root 'user_web_app'
$aiRoot = Join-Path $root 'ai_engine'
$pidsPath = Join-Path $root '.local\processes.json'
$postgresContainer = 'manabu-postgres'

New-Item -ItemType Directory -Path (Join-Path $root '.local') -Force | Out-Null

function Ensure-PostgresContainer {
  $exists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $postgresContainer }
  if (-not $exists) {
    docker run --name $postgresContainer -e POSTGRES_USER=manabu -e POSTGRES_PASSWORD=manabu -e POSTGRES_DB=manabu_backend -p 5434:5432 -d postgres:16-alpine | Out-Host
    Start-Sleep -Seconds 6
    return
  }

  $running = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $postgresContainer }
  if (-not $running) {
    docker start $postgresContainer | Out-Host
    Start-Sleep -Seconds 4
  }
}

function Get-ListenerPid {
  param([int]$Port)

  $lines = cmd /c "netstat -ano | findstr :$Port"
  foreach ($line in $lines) {
    if ($line -match "LISTENING\s+(\d+)$") {
      return [int]$Matches[1]
    }
  }

  return $null
}

function Test-UrlReady {
  param(
    [string]$Url,
    [int]$TimeoutSec = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        if ($statusCode -ge 200 -and $statusCode -lt 500) {
          return $true
        }
      }
    }

    Start-Sleep -Milliseconds 750
  } while ((Get-Date) -lt $deadline)

  return $false
}

if (-not $SkipBuild) {
  Push-Location $backendRoot
  try {
    npm.cmd run build | Out-Host
  } finally {
    Pop-Location
  }

  Push-Location $backendApiRoot
  try {
    npm.cmd run build | Out-Host
  } finally {
    Pop-Location
  }
}

Ensure-PostgresContainer

$existingBackendApiPid = Get-ListenerPid -Port 7200
if ($existingBackendApiPid) {
  $processes = @([PSCustomObject]@{ name = 'backend-api'; port = 7200; pid = $existingBackendApiPid })
} else {
  $backendApiProc = Start-Process -FilePath 'node' -ArgumentList 'dist/server.js' -WorkingDirectory $backendApiRoot -PassThru -WindowStyle Hidden
  $processes = @([PSCustomObject]@{ name = 'backend-api'; port = 7200; pid = $backendApiProc.Id })
}
$services = @(
  @{ Name = 'api-gateway'; Port = 7000 },
  @{ Name = 'auth-service'; Port = 7001 },
  @{ Name = 'user-service'; Port = 7002 },
  @{ Name = 'quiz-service'; Port = 7003 },
  @{ Name = 'learning-service'; Port = 7004 },
  @{ Name = 'gamification-service'; Port = 7005 },
  @{ Name = 'social-service'; Port = 7006 },
  @{ Name = 'analytics-service'; Port = 7007 },
  @{ Name = 'content-service'; Port = 7008 },
  @{ Name = 'notification-service'; Port = 7009 },
  @{ Name = 'sync-service'; Port = 7010 },
  @{ Name = 'recommendation-service'; Port = 7011 }
)
foreach ($svc in $services) {
  $wd = Join-Path $backendRoot "services\$($svc.Name)"
  $existingPid = Get-ListenerPid -Port $svc.Port
  if ($existingPid) {
    $processes += [PSCustomObject]@{ name = $svc.Name; port = $svc.Port; pid = $existingPid }
    continue
  }

  $proc = Start-Process -FilePath 'node' -ArgumentList 'dist/index.js' -WorkingDirectory $wd -PassThru -WindowStyle Hidden
  $processes += [PSCustomObject]@{ name = $svc.Name; port = $svc.Port; pid = $proc.Id }
}

$existingAiPid = Get-ListenerPid -Port 7100
if ($existingAiPid) {
  $processes += [PSCustomObject]@{ name = 'ai-engine-fallback'; port = 7100; pid = $existingAiPid }
} else {
  $aiProc = Start-Process -FilePath 'python' -ArgumentList 'local_server.py' -WorkingDirectory $aiRoot -PassThru -WindowStyle Hidden
  $processes += [PSCustomObject]@{ name = 'ai-engine-fallback'; port = 7100; pid = $aiProc.Id }
}

$includeAdmin = $IncludeAdmin -or $IncludeUI
$includeUserWeb = $IncludeUserWeb -or $IncludeUI

if ($includeAdmin) {
  # Admin panel runs on port 3001 (see admin_panel/package.json).
  $existingAdminPid = Get-ListenerPid -Port 3001
  if ($existingAdminPid) {
    $processes += [PSCustomObject]@{ name = 'admin-panel'; port = 3001; pid = $existingAdminPid }
  } else {
    $adminProc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'dev' -WorkingDirectory $adminRoot -PassThru -WindowStyle Hidden
    $processes += [PSCustomObject]@{ name = 'admin-panel'; port = 3001; pid = $adminProc.Id }
  }
}

if ($includeUserWeb) {
  # User desktop web app runs on port 3000 and contains the dev portal at /dev.
  $existingUserWebPid = Get-ListenerPid -Port 3000
  if ($existingUserWebPid) {
    $processes += [PSCustomObject]@{ name = 'user-web'; port = 3000; pid = $existingUserWebPid }
  } else {
    $userWebProc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'dev' -WorkingDirectory $userWebRoot -PassThru -WindowStyle Hidden
    $processes += [PSCustomObject]@{ name = 'user-web'; port = 3000; pid = $userWebProc.Id }
  }
}

$processes | ConvertTo-Json | Set-Content $pidsPath

$waitSeconds = if ($includeAdmin -or $includeUserWeb) { 24 } else { 8 }
Start-Sleep -Seconds $waitSeconds

$checks = @(
  @{ name = 'backend-api'; url = 'http://127.0.0.1:7200/health' },
  @{ name = 'api-gateway'; url = 'http://127.0.0.1:7000/health' },
  @{ name = 'auth-service'; url = 'http://127.0.0.1:7001/health' },
  @{ name = 'user-service'; url = 'http://127.0.0.1:7002/health' },
  @{ name = 'quiz-service'; url = 'http://127.0.0.1:7003/health' },
  @{ name = 'learning-service'; url = 'http://127.0.0.1:7004/health' },
  @{ name = 'gamification-service'; url = 'http://127.0.0.1:7005/health' },
  @{ name = 'social-service'; url = 'http://127.0.0.1:7006/health' },
  @{ name = 'analytics-service'; url = 'http://127.0.0.1:7007/health' },
  @{ name = 'content-service'; url = 'http://127.0.0.1:7008/health' },
  @{ name = 'notification-service'; url = 'http://127.0.0.1:7009/health' },
  @{ name = 'sync-service'; url = 'http://127.0.0.1:7010/health' },
  @{ name = 'recommendation-service'; url = 'http://127.0.0.1:7011/health' },
  @{ name = 'ai-engine-fallback'; url = 'http://127.0.0.1:7100/health' }
)

if ($includeAdmin) {
  $checks += @{ name = 'admin-panel'; url = 'http://127.0.0.1:3001' }
}

if ($includeUserWeb) {
  $checks += @{ name = 'user-web'; url = 'http://127.0.0.1:3000' }
  $checks += @{ name = 'dev-portal'; url = 'http://127.0.0.1:3000/dev' }
}

Write-Output 'Local stack health check:'
$failCount = 0
foreach ($check in $checks) {
  try {
    if (-not (Test-UrlReady -Url $check.url)) {
      throw "Timed out waiting for ready state"
    }
    Write-Output "OK`t$($check.name)`t$($check.url)"
  } catch {
    $failCount += 1
    Write-Output "FAIL`t$($check.name)`t$($check.url)`t$($_.Exception.Message)"
  }
}

Write-Output "PIDs file: $pidsPath"
Write-Output 'Stop with: powershell -ExecutionPolicy Bypass -File scripts/stop_local_stack.ps1'
Write-Output "Failures: $failCount"
