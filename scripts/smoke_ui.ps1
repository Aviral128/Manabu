param(
  [switch]$UseDev,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$adminRoot = Join-Path $root "admin_panel"
$userRoot = Join-Path $root "user_web_app"

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

function Wait-Url {
  param(
    [string]$Name,
    [string]$Url,
    [int]$TimeoutSec = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    try {
      $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
        Write-Host ("READY`t{0}`t{1}" -f $Name, $Url)
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 750
    }
  } while ((Get-Date) -lt $deadline)

  Write-Host ("FAIL`t{0}`t{1}`tTimed out waiting for route" -f $Name, $Url)
  return $false
}

function Assert-Page {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Contains,
    $Session = $null
  )

  try {
    $args = @{
      Uri = $Url
      UseBasicParsing = $true
      TimeoutSec = 20
    }
    if ($Session) {
      $args.WebSession = $Session
    }

    $resp = Invoke-WebRequest @args
    if (-not $resp.Content.Contains($Contains)) {
      Write-Host ("FAIL`t{0}`t{1}`tMissing expected text: {2}" -f $Name, $Url, $Contains)
      return $false
    }

    Write-Host ("OK`t{0}`t{1}" -f $Name, $Url)
    return $true
  } catch {
    Write-Host ("FAIL`t{0}`t{1}`t{2}" -f $Name, $Url, $_.Exception.Message.Split("`n")[0])
    return $false
  }
}

function Assert-Json {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [object]$Body,
    [scriptblock]$Assert,
    $Session = $null
  )

  try {
    $args = @{
      Method = $Method
      Uri = $Url
      TimeoutSec = 20
    }
    if ($Session) {
      $args.WebSession = $Session
    }

    if ($Method -eq "GET") {
      $result = Invoke-RestMethod @args
    } else {
      $args.ContentType = "application/json"
      $payload = if ($null -eq $Body) { @{} } else { $Body }
      $args.Body = ($payload | ConvertTo-Json -Depth 10)
      $result = Invoke-RestMethod @args
    }

    if ($Assert -and -not (& $Assert $result)) {
      Write-Host ("FAIL`t{0}`t{1}`tAssertion failed" -f $Name, $Url)
      return $false
    }

    Write-Host ("OK`t{0}`t{1}" -f $Name, $Url)
    return $true
  } catch {
    Write-Host ("FAIL`t{0}`t{1}`t{2}" -f $Name, $Url, $_.Exception.Message.Split("`n")[0])
    return $false
  }
}

if (-not $UseDev -and -not $SkipBuild) {
  Push-Location $adminRoot
  try {
    npm.cmd run build | Out-Host
  } finally {
    Pop-Location
  }

  Push-Location $userRoot
  try {
    npm.cmd run build | Out-Host
  } finally {
    Pop-Location
  }
}

$targets = @(
  @{ Name = "admin-panel"; Port = 3001; Url = "http://127.0.0.1:3001/dashboard"; Workdir = $adminRoot; Script = $(if ($UseDev) { "dev" } else { "start" }) },
  @{ Name = "user-web"; Port = 3000; Url = "http://127.0.0.1:3000/"; Workdir = $userRoot; Script = $(if ($UseDev) { "dev" } else { "start" }) }
)

$managedPorts = @()
$failures = 0

try {
  foreach ($target in $targets) {
    $existingPid = Get-ListenerPid -Port $target.Port
    if ($existingPid) {
      Write-Host ("REUSE`t{0}`tport {1}`tpid {2}" -f $target.Name, $target.Port, $existingPid)
      continue
    }

    $null = Start-Process -FilePath "npm.cmd" -ArgumentList "run", $target.Script -WorkingDirectory $target.Workdir -PassThru -WindowStyle Hidden
    $managedPorts += $target.Port
  }

  foreach ($target in $targets) {
    if (-not (Wait-Url -Name $target.Name -Url $target.Url)) {
      $failures += 1
    }
  }

  if ($failures -gt 0) {
    Write-Host ""
    Write-Host ("Failures: {0}" -f $failures)
    exit 1
  }

  $learnerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

  if (-not (Assert-Json -Name "learner login" -Method "POST" -Url "http://127.0.0.1:3000/api/auth/login" -Body @{ email = "learner@manabu.app"; password = "StrongPass123" } -Assert { param($r) $r.success -eq $true } -Session $learnerSession)) { $failures += 1 }
  if (-not (Assert-Json -Name "admin login" -Method "POST" -Url "http://127.0.0.1:3000/api/auth/login" -Body @{ email = "aviral@manabu.app"; password = "StrongPass123" } -Assert { param($r) $r.user.role -eq "admin" } -Session $adminSession)) { $failures += 1 }

  if (-not (Assert-Page -Name "landing page" -Url "http://127.0.0.1:3000/" -Contains "Build mastery")) { $failures += 1 }
  if (-not (Assert-Page -Name "login page" -Url "http://127.0.0.1:3000/login" -Contains "Loading MANABU")) { $failures += 1 }
  if (-not (Assert-Page -Name "learner dashboard" -Url "http://127.0.0.1:3000/app/dashboard" -Contains "Learner dashboard" -Session $learnerSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "quiz hub" -Url "http://127.0.0.1:3000/app/quiz" -Contains "Quiz arena" -Session $learnerSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "mva special" -Url "http://127.0.0.1:3000/app/quiz/mva-special" -Contains "MVA Special" -Session $learnerSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "dev portal" -Url "http://127.0.0.1:3000/dev" -Contains "System overview" -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "dev db" -Url "http://127.0.0.1:3000/dev/db" -Contains "Database Viewer" -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "admin dashboard" -Url "http://127.0.0.1:3001/dashboard" -Contains "Operations center" -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "admin users" -Url "http://127.0.0.1:3001/users" -Contains "Users" -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Page -Name "admin system status" -Url "http://127.0.0.1:3001/system-status" -Contains "System Status" -Session $adminSession)) { $failures += 1 }

  if (-not (Assert-Json -Name "admin proxy user" -Method "GET" -Url "http://127.0.0.1:3001/api/proxy/user/v1/users/usr_001" -Assert { param($r) $r.userId -eq "usr_001" } -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Json -Name "admin proxy moderation" -Method "POST" -Url "http://127.0.0.1:3001/api/proxy/content/v1/content/moderation/queue" -Body @{} -Assert { param($r) $null -ne $r.queuedItems } -Session $adminSession)) { $failures += 1 }
  if (-not (Assert-Json -Name "user proxy recommendations" -Method "GET" -Url "http://127.0.0.1:3000/api/proxy/recommendations/v1/recommendations/next/usr_001" -Assert { param($r) $r.userId -eq "usr_001" } -Session $learnerSession)) { $failures += 1 }
  if (-not (Assert-Json -Name "user proxy auth" -Method "POST" -Url "http://127.0.0.1:3000/api/proxy/auth/v1/auth/login" -Body @{ email = "learner@manabu.app"; password = "StrongPass123" } -Assert { param($r) $null -ne $r.accessToken })) { $failures += 1 }
  if (-not (Assert-Json -Name "dev schemas api" -Method "GET" -Url "http://127.0.0.1:3000/api/dev/schemas" -Assert { param($r) $null -ne $r.postgres -and $null -ne $r.mongo -and $null -ne $r.redis } -Session $adminSession)) { $failures += 1 }

  Write-Host ""
  Write-Host ("Failures: {0}" -f $failures)
  if ($failures -gt 0) { exit 1 } else { exit 0 }
} finally {
  foreach ($port in $managedPorts) {
    $pidToStop = Get-ListenerPid -Port $port
    if ($pidToStop) {
      try {
        Stop-Process -Id $pidToStop -Force -ErrorAction Stop
        Write-Host ("STOP`tport {0}`tpid {1}" -f $port, $pidToStop)
      } catch {
        Write-Host ("SKIP`tport {0}`tunable to stop listener" -f $port)
      }
    }
  }
}
