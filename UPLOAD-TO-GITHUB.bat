@echo off
echo.
echo ================================
echo Health Tracker - GitHub Upload
echo ================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Git is not installed!
    echo Please install from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

set /p USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: health-tracker-app): "
if "%REPO_NAME%"=="" set REPO_NAME=health-tracker-app

echo.
echo Summary:
echo   Username: %USERNAME%
echo   Repository: %REPO_NAME%
echo   URL: https://github.com/%USERNAME%/%REPO_NAME%
echo.
set /p CONFIRM="Is this correct? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Initializing git repository...
git init

echo Adding all files...
git add -A

echo Creating first commit...
git commit -m "Initial commit: Health Tracker App"

echo Adding remote repository...
git remote add origin https://github.com/%USERNAME%/%REPO_NAME%.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
echo ================================
echo DONE! Your code is on GitHub!
echo ================================
echo.
echo Next Steps:
echo 1. Go to: https://github.com/%USERNAME%/%REPO_NAME%
echo 2. Click Settings - Pages
echo 3. Under 'Source', select: GitHub Actions
echo 4. Your app will be live at: https://%USERNAME%.github.io/%REPO_NAME%
echo.
pause
