@echo off
cd /d "%~dp0"

echo ========================================
echo   iPhone build (friend distribution)
echo ========================================
echo.
echo Requires Apple Developer account ($99/year).
echo First time: npx eas-cli login
echo.

if not exist "node_modules\" (
  echo Installing packages...
  call npm.cmd install
)

call npx.cmd eas-cli build --platform ios --profile preview

pause
