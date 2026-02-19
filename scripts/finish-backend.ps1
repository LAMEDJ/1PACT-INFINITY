# 1PACT - Une fois le backend deploye sur Render : colle l'URL dans backend-url.txt puis lance ce script.
# Ce script lit l'URL et appelle set-backend-url-and-redeploy.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$urlFile = Join-Path $root "backend-url.txt"

if (-not (Test-Path $urlFile)) {
    Write-Host "Fichier absent: backend-url.txt (a la racine du projet). Cree-le et mets-y l'URL Render (ex. https://1pact-api-xxx.onrender.com)" -ForegroundColor Red
    exit 1
}

$url = (Get-Content $urlFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($url) -or $url -like "*REMPLACER*" -or $url -notlike "https://*.onrender.com*") {
    Write-Host "Ouvre backend-url.txt et mets l'URL de ton backend Render (ex. https://1pact-api-xxxx.onrender.com)" -ForegroundColor Yellow
    exit 1
}

Write-Host "URL backend: $url" -ForegroundColor Cyan
& (Join-Path $root "scripts\set-backend-url-and-redeploy.ps1") $url
