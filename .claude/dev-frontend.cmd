@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0..\frontend"
call npm run dev
