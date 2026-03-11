$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$powerShellPath = Join-Path $env:SystemRoot "System32\\WindowsPowerShell\\v1.0\\powershell.exe"
$taskName = "MANABU-Stack"
$taskCommand = "`"$powerShellPath`" -ExecutionPolicy Bypass -File `"$root\\scripts\\pm2_boot.ps1`""
$startupDir = Join-Path $env:APPDATA "Microsoft\\Windows\\Start Menu\\Programs\\Startup"
$startupCmd = Join-Path $startupDir "MANABU-Stack.cmd"

Set-Location $root

Write-Output "Ensuring PostgreSQL container is running..."
& $powerShellPath -ExecutionPolicy Bypass -File (Join-Path $root "scripts\\ensure_postgres_container.ps1") | Out-Host

Write-Output "Building MANABU release apps..."
npm run build | Out-Host

Write-Output "Starting MANABU with PM2..."
npx pm2 start ecosystem.config.cjs --env production | Out-Host
npx pm2 save | Out-Host

Write-Output "Registering Windows startup task..."
try {
  & "$env:SystemRoot\\System32\\schtasks.exe" /Create /F /SC ONLOGON /RL LIMITED /TN $taskName /TR $taskCommand | Out-Host
} catch {
  Write-Output "Scheduled task registration was blocked. Falling back to the user's Startup folder."
  New-Item -ItemType Directory -Path $startupDir -Force | Out-Null
  "@echo off`r`n$taskCommand`r`n" | Set-Content -Path $startupCmd -Encoding ASCII
}

Write-Output ""
Write-Output "MANABU now has:"
Write-Output "- PM2-managed production services"
Write-Output "- auto-start on Windows sign-in for this user"
Write-Output ""
Write-Output "Manual controls:"
Write-Output "- Start now: npm run prod-start"
Write-Output "- Stop now: npm run prod-stop"
Write-Output "- PM2 status: npx pm2 status"
Write-Output "- Remove startup task: schtasks /Delete /TN $taskName /F"
Write-Output "- Startup folder fallback: $startupCmd"
