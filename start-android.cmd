@echo off
cd /d "%~dp0"

echo ========================================
echo   D-Day Gifticon - Remote Connection
echo ========================================
echo.
echo Different Wi-Fi / LTE is OK (Cloudflare tunnel).
echo Expo Go SDK 54 required (Play Store version).
echo.

if not exist "node_modules\expo\bin\cli" (
  echo Installing packages...
  call npm.cmd install
  if errorlevel 1 exit /b 1
)

node scripts\start-remote.js

pause
