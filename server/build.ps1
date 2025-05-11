# Clean install of dependencies
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "../node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "../package-lock.json" -Force -ErrorAction SilentlyContinue

# Create root package.json if it doesn't exist
if (-not (Test-Path "../package.json")) {
    Set-Content -Path "../package.json" -Value '{
  "name": "tourism-guide-app-root",
  "private": true,
  "dependencies": {
    "zod": "^3.22.4"
  }
}'
}

# Install dependencies in root directory for shared code
Push-Location ..
npm install
Pop-Location

# Install dependencies with specific focus on zod in server directory
npm install
npm install --save zod@3.22.4

# Run TypeScript compilation
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!"
} else {
    Write-Host "Build failed!"
    exit 1
} 