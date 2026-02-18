# 1PACT - Connect to GitHub and deploy on Vercel
# Run from project root. Requires: gh auth login (once) or set GH_TOKEN.

param(
    [string]$RepoName = "1pact-infinity",
    [switch]$SkipGitHub,
    [switch]$SkipVercel
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

# --- GitHub ---
if (-not $SkipGitHub) {
    if (-not (git remote get-url origin 2>$null)) {
        if ($env:GH_TOKEN) {
            $env:GH_TOKEN | gh auth login --with-token
        }
        if (-not (gh auth status 2>$null)) {
            Write-Host "Run once: gh auth login" -ForegroundColor Yellow
            gh auth login
        }
        gh repo create $RepoName --public --source=. --remote=origin --push
        Write-Host "GitHub: repo created and pushed." -ForegroundColor Green
    } else {
        git push -u origin main 2>$null; if ($LASTEXITCODE -eq 0) { Write-Host "GitHub: pushed." -ForegroundColor Green }
    }
}

# --- Vercel ---
if (-not $SkipVercel) {
    Set-Location frontend
    if (-not (Test-Path .vercel)) {
        npx vercel link --yes 2>&1
    }
    npx vercel --prod --yes 2>&1
    Set-Location ..
    Write-Host "Vercel: deploy triggered." -ForegroundColor Green
}

Write-Host "Done. In Vercel dashboard set Root Directory to 'frontend' if not already." -ForegroundColor Cyan
