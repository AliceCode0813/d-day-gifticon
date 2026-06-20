@echo off
cd /d "%~dp0"

echo ========================================
echo   Android APK build
echo ========================================
echo.

if not exist "node_modules\expo\bin\cli" (
  echo Installing packages...
  call npm.cmd install
  if errorlevel 1 exit /b 1
)

echo Checking Expo login...
call npx.cmd eas-cli whoami >nul 2>&1
if errorlevel 1 (
  echo.
  echo Expo login required. Browser or email login will open.
  echo.
  call npx.cmd eas-cli login
  if errorlevel 1 (
    echo Login failed. Try again: npx eas-cli login
    pause
    exit /b 1
  )
)

echo.
echo Starting cloud build (about 10-20 min)...
echo Download APK from https://expo.dev when finished.
echo.

call npx.cmd eas-cli build --platform android --profile preview
if errorlevel 1 (
  echo.
  echo Build failed. Check the message above.
  pause
  exit /b 1
)

echo.
echo Done. Open expo.dev -^> Projects -^> dday-gifticon -^> Builds -^> Download APK
pause
