@echo off
echo Installing Portfolio dependencies...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not found. Please reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node version:
node --version
echo npm version:
npm --version
echo.

echo Running npm install...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed. Check the errors above.
    pause
    exit /b 1
)

echo.
echo All dependencies installed successfully!
echo Run "npm run dev" to start the development server.
pause
