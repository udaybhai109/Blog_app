$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pgRoot = Join-Path $projectRoot ".tools\postgres"
$pgBin = Join-Path $pgRoot "pgsql\bin"
$pgData = Join-Path $pgRoot "data"
$pgLog = Join-Path $pgRoot "postgres.log"
$pwFile = Join-Path $pgRoot "pgpass.txt"

if (-not (Test-Path (Join-Path $pgBin "postgres.exe"))) {
  throw "PostgreSQL binaries not found at $pgBin. Download/extract them first."
}

if (-not (Test-Path (Join-Path $pgData "PG_VERSION"))) {
  New-Item -ItemType Directory -Force -Path $pgData | Out-Null
  Set-Content -Path $pwFile -Value "postgres" -NoNewline
  & (Join-Path $pgBin "initdb.exe") -D $pgData -U postgres --pwfile=$pwFile --auth=scram-sha-256 | Out-Null
}

& (Join-Path $pgBin "pg_ctl.exe") -D $pgData status | Out-Null
if ($LASTEXITCODE -ne 0) {
  & (Join-Path $pgBin "pg_ctl.exe") -D $pgData -l $pgLog -o "-p 5432" start | Out-Null
}

$env:PGPASSWORD = "postgres"
$exists = & (Join-Path $pgBin "psql.exe") -h localhost -p 5432 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='tash';"
if (-not $exists) {
  & (Join-Path $pgBin "createdb.exe") -h localhost -p 5432 -U postgres tash
}

Write-Output "Local PostgreSQL is running on localhost:5432 (db: tash)."
