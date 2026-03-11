$ErrorActionPreference = "Stop"
$postgresContainer = "manabu-postgres"

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

Ensure-PostgresContainer
Write-Output "Postgres container ready: $postgresContainer"
