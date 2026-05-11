# ====================================================
# RESTART BACKEND - No Port Conflicts!
# ====================================================
# Double-click this file to restart your backend cleanly
# ====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Smart Attendance System - Backend    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any existing backend process on port 8080
Write-Host "🔍 Checking for existing processes on port 8080..." -ForegroundColor Yellow

$existingProcess = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($existingProcess) {
    $pid = $existingProcess.OwningProcess
    Write-Host "⚠️  Found existing process (PID: $pid) on port 8080" -ForegroundColor Yellow
    Write-Host "🛑 Stopping existing process..." -ForegroundColor Yellow
    
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "✅ Previous process stopped" -ForegroundColor Green
} else {
    Write-Host "✅ Port 8080 is free" -ForegroundColor Green
}

Write-Host ""

# Step 2: Navigate to backend directory
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

Write-Host "📂 Working directory: $backendPath" -ForegroundColor Cyan
Write-Host ""

# Step 3: Start the backend
Write-Host "🚀 Starting Spring Boot Backend..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run Maven Spring Boot
mvn spring-boot:run

# If Maven exits, pause to show any errors
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  Backend Stopped" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
