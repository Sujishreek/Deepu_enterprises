@echo off
cd /d "%~dp0frontend"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Deepu Enterprises local server" cmd /k py -m http.server 8000
) else (
  start "Deepu Enterprises local server" cmd /k python -m http.server 8000
)
timeout /t 2 >nul
start "" http://localhost:8000/
