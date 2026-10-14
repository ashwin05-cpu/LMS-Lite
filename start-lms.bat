@echo off
title LMS Lite - Launcher
echo ========================================================
echo  Launching LMS Lite (Backend + Frontend)
echo ========================================================
start "LMS Lite Backend (Port 8080)" cmd /k "cd /d "%~dp0" && start-backend.bat"
timeout /t 5 /nobreak >nul
start "LMS Lite Frontend (Port 3000)" cmd /k "cd /d "%~dp0" && start-frontend.bat"
echo.
echo Both servers have been launched!
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:3000
echo - H2 Database Console: http://localhost:8080/h2-console
echo ========================================================
timeout /t 10
