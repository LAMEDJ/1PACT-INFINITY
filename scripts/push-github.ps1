# 1PACT - Creer le depot GitHub et pousser le code
# A lancer UNE FOIS que tu as fait: gh auth login (et entre le code dans le navigateur)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$repo = "1pact-infinity"
$gh = "${env:ProgramFiles}\GitHub CLI\gh.exe"

if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI (gh) non trouve. Installe-le: winget install GitHub.cli" -ForegroundColor Red
    exit 1
}

# Verifier qu'on est connecte
& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tu n'es pas connecte a GitHub. Lance d'abord: gh auth login" -ForegroundColor Yellow
    Write-Host "Puis relance ce script." -ForegroundColor Yellow
    exit 1
}

# Creer le depot et pousser (si pas de remote origin)
$origin = git remote get-url origin 2>$null
if (-not $origin) {
    & $gh repo create $repo --public --source=. --remote=origin --push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Depot cree et code pousse sur GitHub." -ForegroundColor Green
    } else {
        exit 1
    }
} else {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Code pousse sur GitHub." -ForegroundColor Green
    } else {
        exit 1
    }
}

Write-Host ""
Write-Host "Prochaine etape: sur vercel.com -> projet frontend -> Settings -> Git -> Connect Git Repository (choisis le depot $repo), Root Directory = frontend" -ForegroundColor Cyan
