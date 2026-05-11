@echo off
REM ====================================================
REM RESTART BACKEND - No Port Conflicts!
REM ====================================================
REM Double-click this file to restart your backend cleanly
REM ====================================================

echo.
echo ========================================
echo   Smart Attendance System - Backend
echo ========================================
echo.

echo Checking for existing processes on port 8080...

REM Kill any process using port 8080
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') DO (
    echo Found process using port 8080 (PID: %%P)
    echo Stopping process...
    taskkill /F /PID %%P >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo Process stopped
)

echo Port 8080 is now free
echo.

REM Navigate to backend directory
cd /d "%~dp0"

echo Starting Spring Boot Backend...
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start Maven
mvn spring-boot:run

echo.
echo ========================================
echo   Backend Stopped
echo ========================================
echo.
pause
