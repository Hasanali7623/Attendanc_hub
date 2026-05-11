# Smart Attendance System - Frontend Setup Script
# Run this in PowerShell

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Smart Attendance System - Frontend Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "To start the development server, run:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    
    Write-Host "To build for production, run:" -ForegroundColor Yellow
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host ""
    
    Write-Host "The app will be available at:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Demo Login Credentials:" -ForegroundColor Yellow
    Write-Host "  Student - student@test.com / password" -ForegroundColor White
    Write-Host "  Admin   - admin@test.com / password" -ForegroundColor White
    Write-Host ""
    
    Write-Host "For more information, see:" -ForegroundColor Yellow
    Write-Host "  - README.md" -ForegroundColor White
    Write-Host "  - QUICKSTART.md" -ForegroundColor White
    Write-Host "  - PROJECT_SUMMARY.md" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Happy Coding! 🚀" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
