@echo off
title Deepu Enterprises - Website + Admin
echo ====================================================================
echo   Deepu Enterprises
echo   User website : http://localhost:8000/user/
echo   Admin panel  : http://localhost:8000/Admin/Frontend/
echo   Admin sign-in uses credentials configured in Apps Script.
echo ====================================================================
start http://localhost:8000/user/
python -m http.server 8000
pause
