# Clean install of dependencies
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Install dependencies with specific focus on zod
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