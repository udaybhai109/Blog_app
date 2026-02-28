$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeBin = Join-Path $projectRoot ".tools\node-v18.20.8-win-x64"

if (-not (Test-Path (Join-Path $nodeBin "node.exe"))) {
  throw "Node.js not found at $nodeBin."
}

$env:Path = "$nodeBin;$env:Path"
$env:NEXT_TELEMETRY_DISABLED = "1"

& (Join-Path $PSScriptRoot "start-local-db.ps1")

Set-Location $projectRoot
npm run dev
