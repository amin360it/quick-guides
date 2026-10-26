@echo off
setlocal

:: --- Configuration --------------------------------------------------------
set "PORT=8080"
if not "%1"=="" set "PORT=%1"
:: --------------------------------------------------------------------------

echo Starting web server...
echo Root: %CD%
echo URL:  http://localhost:%PORT%/
echo.
echo Press Ctrl+C to stop.
echo.

node server.js

pause
