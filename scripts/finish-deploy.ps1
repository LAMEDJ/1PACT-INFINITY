# 1PACT - Finaliser GitHub + Vercel (à lancer une fois les logins faits)
# 1) Ouvrir PowerShell à la racine du projet
# 2) Lancer : gh auth login   (valider dans le navigateur)
# 3) Lancer : cd frontend; npx vercel login   (valider dans le navigateur)
# 4) Lancer ce script : .\scripts\finish-deploy.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path "$root\frontend\package.json")) { $root = (Get-Location).Path }
Set-Location $root

Write-Host "`n=== 1. GitHub ===" -ForegroundColor Cyan
$path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$env:Path = $path

$ghOk = $false
try { $null = gh auth status 2>&1; $ghOk = $LASTEXITCODE -eq 0 } catch {}
if (-not $ghOk) {
    Write-Host "GitHub non connecte. Lancez: gh auth login" -ForegroundColor Yellow
    gh auth login --web --hostname github.com -p https
}

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Creation du depot GitHub et push..." -ForegroundColor Green
    gh repo create 1pact-infinity --public --source=. --remote=origin --push
    Write-Host "GitHub: OK" -ForegroundColor Green
} else {
    Write-Host "Push vers origin..." -ForegroundColor Green
    git push -u origin main 2>&1
    Write-Host "GitHub: OK" -ForegroundColor Green
}

Write-Host "`n=== 2. Vercel ===" -ForegroundColor Cyan
Set-Location "$root\frontend"
if (-not (Test-Path .vercel)) {
    Write-Host "Liaison du projet Vercel..." -ForegroundColor Green
    npx vercel link --yes 2>&1
}
Write-Host "Deploiement production..." -ForegroundColor Green
npx vercel --prod --yes 2>&1
Set-Location $root

Write-Host "`n=== Termine ===" -ForegroundColor Green
Write-Host "Sur vercel.com, definissez Root Directory = 'frontend' si ce n'est pas deja fait." -ForegroundColor Cyan
Write-Host "Les prochains 'git push origin main' declencheront un deploy auto si le repo est connecte a Vercel." -ForegroundColor Cyan
