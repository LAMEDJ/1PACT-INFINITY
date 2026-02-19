# 1PACT - Definir l'URL du backend (Render) sur Vercel et redéployer
# Usage: .\scripts\set-backend-url-and-redeploy.ps1 "https://1pact-api-xxxx.onrender.com"
# (Remplace par l'URL exacte de ton service Render.)

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location "$root\frontend"

# Retirer le slash final si present
$BackendUrl = $BackendUrl.TrimEnd('/')
$ApiUrl = "$BackendUrl/api"

Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
Write-Host "VITE_API_URL sera: $ApiUrl" -ForegroundColor Cyan

if (-not (Test-Path .vercel)) {
    Write-Host "Projet non lie a Vercel. Lance: npx vercel link --yes" -ForegroundColor Red
    exit 1
}

# Ajouter la variable pour production (valeur via fichier temporaire)
$tmp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $tmp -Value $ApiUrl -NoNewline
Write-Host "Ajout de VITE_API_URL sur Vercel (production)..." -ForegroundColor Green
Get-Content $tmp | npx vercel env add VITE_API_URL production --force 2>&1
Remove-Item $tmp -ErrorAction SilentlyContinue

Write-Host "Redéploiement production..." -ForegroundColor Green
npx vercel --prod --yes 2>&1

Write-Host "Termine. Le site Vercel utilise maintenant le backend: $BackendUrl" -ForegroundColor Green
