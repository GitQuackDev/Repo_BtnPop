# Launch both frontend and backend for development

# Create a temporary package.json to use concurrently locally
$tempPackageJsonPath = "temp-package.json"

# Check if the temporary package.json exists, if not create it
if (-not (Test-Path $tempPackageJsonPath)) {
    Write-Host "Creating temporary package.json for development scripts..."
    @"
{
  "name": "btnpop-dev",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "backend": "cd backend && npm run dev",
    "frontend": "cd btnpop-app && npm start",
    "dev": "npm run backend & npm run frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
"@ | Out-File -FilePath $tempPackageJsonPath -Encoding utf8
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing development dependencies..."
    npm install --prefix .
}

# Run both applications
Write-Host "Starting both backend and frontend applications..."
Write-Host "Backend will run on http://localhost:5000"
Write-Host "Frontend will run on http://localhost:3000"
npm run --prefix . dev
