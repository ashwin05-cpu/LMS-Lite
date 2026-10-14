@echo off
title LMS Lite - Spring Boot Backend (Port 8080)
echo ========================================================
echo  Starting LMS Lite Spring Boot 3.3.4 REST API Server
echo ========================================================
cd /d "%~dp0backend"
java -jar target\lms-lite-backend-1.0.0.jar
pause
