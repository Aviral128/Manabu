$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Set-Location $root

try {
  npx pm2 resurrect | Out-Host
} catch {
  npx pm2 start ecosystem.config.cjs --env production | Out-Host
  npx pm2 save | Out-Host
}
