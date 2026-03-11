param(
  [Parameter(Mandatory = $true)][string]$FilePath,
  [string[]]$Arguments = @(),
  [Parameter(Mandatory = $true)][string]$WorkingDirectory
)

$ErrorActionPreference = "Stop"

Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $WorkingDirectory -WindowStyle Hidden | Out-Null
