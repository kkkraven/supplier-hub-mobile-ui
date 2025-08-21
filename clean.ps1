# PowerShell script for cleaning Next.js cache
Write-Host "Cleaning Next.js cache..." -ForegroundColor Green

# Remove .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Removed .next folder" -ForegroundColor Green
}

# Remove node_modules cache
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "Removed node_modules cache" -ForegroundColor Green
}

Write-Host "Cleaning completed!" -ForegroundColor Green
