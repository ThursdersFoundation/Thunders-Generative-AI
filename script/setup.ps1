# ⚡ Thunders Generative AI — development setup for Windows PowerShell.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
Write-Host "⚡ Setting up Thunders Generative AI in $root"

# 1. Python environment
if (-not (Test-Path ".venv")) {
  py -m venv .venv
}
& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\pip.exe" install -r backend/requirements.txt
& ".venv\Scripts\pip.exe" install -e "backend[dev]"
& ".venv\Scripts\pip.exe" install -e "sdk/python[dev]"

# 2. Node environment
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm install
} else {
  Write-Warning "pnpm not found - enable it with: corepack enable && corepack prepare pnpm@latest --activate"
}

# 3. Environment files
$examples = @(".env.example", "backend/.env.example", "apps/web/.env.example")
foreach ($example in $examples) {
  $target = $example -replace "\.example$", ""
  if ((Test-Path $example) -and (-not (Test-Path $target))) {
    Copy-Item $example $target
    Write-Host "  created $target"
  }
}

Write-Host "✅ Setup complete. Try: make help"
