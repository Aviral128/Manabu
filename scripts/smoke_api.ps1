param(
  [string]$HostBase = "http://127.0.0.1",
  [string]$UserId = "usr_001",
  [switch]$IncludeUI
)

$ErrorActionPreference = "Continue"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Invoke-Smoke {
  param(
    [Parameter(Mandatory=$true)][string]$Name,
    [Parameter(Mandatory=$true)][ValidateSet("GET","POST","PUT","PATCH","DELETE")][string]$Method,
    [Parameter(Mandatory=$true)][string]$Url,
    [object]$Body = $null,
    [int]$TimeoutSec = 6
  )

  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    if ($Method -eq "GET") {
      $null = Invoke-RestMethod -Method GET -Uri $Url -TimeoutSec $TimeoutSec
    } else {
      # Many endpoints accept an empty JSON payload for "action" style POSTs.
      $payload = if ($null -eq $Body) { @{ } } else { $Body }
      $json = $payload | ConvertTo-Json -Depth 10
      $null = Invoke-RestMethod -Method $Method -Uri $Url -ContentType "application/json" -Body $json -TimeoutSec $TimeoutSec
    }

    $sw.Stop()
    Write-Host ("OK  `t{0}ms`t{1}`t{2}" -f $sw.ElapsedMilliseconds, $Name, $Url)
    return $true
  } catch {
    $sw.Stop()
    $msg = $_.Exception.Message.Split("`n")[0]
    Write-Host ("FAIL`t{0}ms`t{1}`t{2}`t{3}" -f $sw.ElapsedMilliseconds, $Name, $Url, $msg)
    return $false
  }
}

$fails = 0

Write-Host "MANABU smoke check (API):"
Write-Host ("HostBase: {0}" -f $HostBase)
Write-Host ("UserId:   {0}" -f $UserId)
Write-Host ""

# Gateway
if (-not (Invoke-Smoke -Name "backend api health" -Method GET -Url "${HostBase}:7200/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "backend quizzes" -Method GET -Url "${HostBase}:7200/api/quizzes")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "gateway health" -Method GET -Url "${HostBase}:7000/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "gateway routes" -Method GET -Url "${HostBase}:7000/v1/routes")) { $fails += 1 }

# Auth
if (-not (Invoke-Smoke -Name "auth health" -Method GET -Url "${HostBase}:7001/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "auth login" -Method POST -Url "${HostBase}:7001/v1/auth/login" -Body @{ email = "learner@manabu.app"; password = "StrongPass123" })) { $fails += 1 }

# User
if (-not (Invoke-Smoke -Name "user health" -Method GET -Url "${HostBase}:7002/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "user profile" -Method GET -Url "${HostBase}:7002/v1/users/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "user history" -Method GET -Url "${HostBase}:7002/v1/users/$UserId/history")) { $fails += 1 }

# Quiz
if (-not (Invoke-Smoke -Name "quiz health" -Method GET -Url "${HostBase}:7003/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "quiz questions" -Method GET -Url "${HostBase}:7003/v1/quiz/questions")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "quiz session create" -Method POST -Url "${HostBase}:7003/v1/quiz/sessions" -Body @{ userId = $UserId; topic = "algebra"; difficulty = "easy"; questionCount = 5; timed = $true })) { $fails += 1 }

# Learning
if (-not (Invoke-Smoke -Name "learning health" -Method GET -Url "${HostBase}:7004/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "learning plan" -Method GET -Url "${HostBase}:7004/v1/learning/plan/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "learning graph" -Method GET -Url "${HostBase}:7004/v1/learning/knowledge-graph/$UserId")) { $fails += 1 }

# Gamification
if (-not (Invoke-Smoke -Name "gamification health" -Method GET -Url "${HostBase}:7005/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "gamification profile" -Method GET -Url "${HostBase}:7005/v1/gamification/profile/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "gamification rewards" -Method GET -Url "${HostBase}:7005/v1/gamification/rewards/$UserId")) { $fails += 1 }

# Social
if (-not (Invoke-Smoke -Name "social health" -Method GET -Url "${HostBase}:7006/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "social friends" -Method GET -Url "${HostBase}:7006/v1/social/friends/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "social leaderboard" -Method GET -Url "${HostBase}:7006/v1/social/leaderboard/global")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "social battle create" -Method POST -Url "${HostBase}:7006/v1/social/battles")) { $fails += 1 }

# Analytics
if (-not (Invoke-Smoke -Name "analytics health" -Method GET -Url "${HostBase}:7007/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "analytics dashboard" -Method GET -Url "${HostBase}:7007/v1/analytics/dashboard/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "analytics retention" -Method GET -Url "${HostBase}:7007/v1/analytics/retention")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "analytics event ingest" -Method POST -Url "${HostBase}:7007/v1/analytics/events")) { $fails += 1 }

# Content
if (-not (Invoke-Smoke -Name "content health" -Method GET -Url "${HostBase}:7008/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "content course fetch" -Method GET -Url "${HostBase}:7008/v1/content/courses/course_001")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "content moderation queue" -Method POST -Url "${HostBase}:7008/v1/content/moderation/queue")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "content question draft" -Method POST -Url "${HostBase}:7008/v1/content/questions")) { $fails += 1 }

# Notifications
if (-not (Invoke-Smoke -Name "notifications health" -Method GET -Url "${HostBase}:7009/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "notifications daily challenge" -Method POST -Url "${HostBase}:7009/v1/notifications/daily-challenge")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "notifications reminders" -Method POST -Url "${HostBase}:7009/v1/notifications/reminders")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "notifications achievements" -Method POST -Url "${HostBase}:7009/v1/notifications/achievements")) { $fails += 1 }

# Sync
if (-not (Invoke-Smoke -Name "sync health" -Method GET -Url "${HostBase}:7010/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "sync conflicts" -Method GET -Url "${HostBase}:7010/v1/sync/conflicts/$UserId")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "sync offline batch" -Method POST -Url "${HostBase}:7010/v1/sync/offline-batch")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "sync checkpoint" -Method POST -Url "${HostBase}:7010/v1/sync/checkpoint/$UserId")) { $fails += 1 }

# Recommendations
if (-not (Invoke-Smoke -Name "recommendations health" -Method GET -Url "${HostBase}:7011/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "recommendations next" -Method GET -Url "${HostBase}:7011/v1/recommendations/next/$UserId")) { $fails += 1 }

# AI
if (-not (Invoke-Smoke -Name "ai health" -Method GET -Url "${HostBase}:7100/health")) { $fails += 1 }
if (-not (Invoke-Smoke -Name "ai question generation" -Method POST -Url "${HostBase}:7100/v1/ai/question-generation" -Body @{ topic = "algebra"; difficulty = "easy"; count = 3 })) { $fails += 1 }
if (-not (Invoke-Smoke -Name "ai tutor explanation" -Method POST -Url "${HostBase}:7100/v1/ai/tutor-explanation" -Body @{ question = "What is 2 + 2?"; userAnswer = "4" })) { $fails += 1 }

if ($IncludeUI) {
  if (-not (Invoke-Smoke -Name "user web home" -Method GET -Url "http://127.0.0.1:3000")) { $fails += 1 }
  if (-not (Invoke-Smoke -Name "dev portal" -Method GET -Url "http://127.0.0.1:3000/dev")) { $fails += 1 }
  if (-not (Invoke-Smoke -Name "admin panel" -Method GET -Url "http://127.0.0.1:3001")) { $fails += 1 }
}

Write-Host ""
Write-Host ("Failures: {0}" -f $fails)
if ($fails -gt 0) { exit 1 } else { exit 0 }
