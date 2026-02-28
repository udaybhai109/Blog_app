$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pgCtl = Join-Path $projectRoot ".tools\postgres\pgsql\bin\pg_ctl.exe"
$pgData = Join-Path $projectRoot ".tools\postgres\data"

if (-not (Test-Path $pgCtl)) {
  throw "pg_ctl not found at $pgCtl"
}

& $pgCtl -D $pgData stop
Write-Output "Local PostgreSQL stopped."
