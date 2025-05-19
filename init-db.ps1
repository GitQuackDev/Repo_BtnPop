# Database initialization script for the BTN Pop CMS

Write-Host "===== BTN Pop CMS Database Initialization =====" -ForegroundColor Cyan
Write-Host ""

# Move to the backend directory
Set-Location -Path ".\backend"

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Create the uploads directory if it doesn't exist
if (-not (Test-Path "uploads")) {
    Write-Host "Creating uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}

# Initialize the admin user
Write-Host "Creating admin user..." -ForegroundColor Yellow
npm run init-admin

# Seed the database with sample data
Write-Host "Seeding database with sample content..." -ForegroundColor Yellow
npm run seed

Write-Host ""
Write-Host "===== Database Initialization Complete =====" -ForegroundColor Green
Write-Host ""
Write-Host "Admin Login Credentials:" -ForegroundColor Cyan
Write-Host "Email: admin@btnpop.com" -ForegroundColor White
Write-Host "Password: adminPassword123" -ForegroundColor White
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Cyan
Write-Host ".\dev.ps1" -ForegroundColor White
Write-Host ""

# Return to the original directory
Set-Location -Path ".."
