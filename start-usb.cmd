@echo off
cd /d "%~dp0"

echo ========================================
echo   D-Day Gifticon - USB Connection
echo ========================================
echo.
echo Phone USB + USB debugging required.
echo Works even on different Wi-Fi or LTE.
echo.

if not exist "node_modules\" (
  echo Installing packages...
  call npm.cmd install
)

node scripts\start-usb.js

pause
