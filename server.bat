@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  server.bat — All-in-One Local Web Server
::  Start / Stop / Status controls
::  Runtimes: Node.js LTS / PHP 8.4 / Python 3.13 / IIS
::  Install/Uninstall via winget
:: ============================================================

set "PORT=8080"
set "TITLE=All-in-One Web Server"
set "PIDFILE=%TEMP%\webserver_%PORT%.pid"

:: --- Detect dependencies --------------------------------------
call :check_deps

:: --- Main menu -----------------------------------------------
:main
cls
echo.
echo  ====================================================
echo   %TITLE%
echo  ====================================================
echo.
echo   Port: %PORT%    Root: %CD%
echo.
echo  --- Server Control ---
echo    1. Start Server ^(background^)
echo    2. Stop Server
echo    3. Server Status
echo    4. Restart Server
echo.
echo  --- Start with Specific Runtime ---
echo    5. Node.js
echo    6. PHP
echo    7. Python
echo    8. IIS ^(if installed^)
echo    9. Network Server ^(LAN accessible^)
echo.
echo  --- Dependencies ---
echo   10. Check installed runtimes
echo   11. Install / Uninstall runtimes
echo.
echo  --- Info ---
echo   12. Show network info ^(LAN IPs^)
echo   13. Set port ^(current: %PORT%^)
echo.
echo    Q. Quit
echo.
echo  ====================================================
set /p "CHOICE=Select option: "

if "%CHOICE%"=="1" goto start_bg
if "%CHOICE%"=="2" goto stop_server
if "%CHOICE%"=="3" goto status_server
if "%CHOICE%"=="4" goto restart_server
if "%CHOICE%"=="5" goto node
if "%CHOICE%"=="6" goto php
if "%CHOICE%"=="7" goto python
if "%CHOICE%"=="8" goto iis
if "%CHOICE%"=="9" goto network
if "%CHOICE%"=="10" goto check
if "%CHOICE%"=="11" goto install_menu
if "%CHOICE%"=="12" goto netinfo
if "%CHOICE%"=="13" goto setport
if /i "%CHOICE%"=="Q" exit /b 0
goto main

:: --- Set port -------------------------------------------------
:setport
set /p "NEWPORT=Enter port number (1024-65535): "
if "%NEWPORT%"=="" goto main
set "PORT=%NEWPORT%"
set "PIDFILE=%TEMP%\webserver_%PORT%.pid"
goto main

:: --- Start in background --------------------------------------
:start_bg
call :is_running
if "%SERVER_RUNNING%"=="1" (
    echo.
    echo  [INFO] Server already running on port %PORT% ^(PID %SERVER_PID%^)
    echo.
    pause
    goto main
)
echo.
echo  Starting server in background on port %PORT%...
echo  URL: http://localhost:%PORT%/
echo.

if "%NODE_OK%"=="1" (
    start "WebServer-%PORT%" /min cmd /c "node "%~dp0server.js" ^> "%TEMP%\webserver_%PORT%.log" 2^>^&1"
) else if "%PHP_OK%"=="1" (
    start "WebServer-%PORT%" /min cmd /c "php -S 0.0.0.0:%PORT% -t "%CD%" ^> "%TEMP%\webserver_%PORT%.log" 2^>^&1"
) else if "%PY_OK%"=="1" (
    start "WebServer-%PORT%" /min cmd /c "python -m http.server %PORT% --bind 0.0.0.0 ^> "%TEMP%\webserver_%PORT%.log" 2^>^&1"
) else (
    echo  [ERROR] No runtime found. Install one first ^(option 11^).
    echo.
    pause
    goto main
)

:: Wait a moment and find the PID
timeout /t 2 /nobreak >nul
call :find_pid
if "%SERVER_PID%"=="" (
    echo  [INFO] Server starting... check status with option 3.
) else (
    echo %SERVER_PID% > "%PIDFILE%"
    echo  [OK] Server started ^(PID %SERVER_PID%^)
    echo  Log: %TEMP%\webserver_%PORT%.log
)
echo.
pause
goto main

:: --- Stop server ----------------------------------------------
:stop_server
call :is_running
if "%SERVER_RUNNING%"=="0" (
    echo.
    echo  [INFO] No server running on port %PORT%
    echo.
    pause
    goto main
)
echo.
echo  Stopping server ^(PID %SERVER_PID%^)...
taskkill /PID %SERVER_PID% /F >nul 2>&1
if exist "%PIDFILE%" del "%PIDFILE%"
echo  [OK] Server stopped.
echo.
pause
goto main

:: --- Server status --------------------------------------------
:status_server
call :is_running
echo.
echo  === Server Status ===
echo  Port: %PORT%
if "%SERVER_RUNNING%"=="1" (
    echo  Status: RUNNING ^(PID %SERVER_PID%^)
    echo  URL: http://localhost:%PORT%/
    echo  Log: %TEMP%\webserver_%PORT%.log
) else (
    echo  Status: STOPPED
)
echo.
pause
goto main

:: --- Restart server -------------------------------------------
:restart_server
call :is_running
if "%SERVER_RUNNING%"=="1" (
    echo.
    echo  Stopping server ^(PID %SERVER_PID%^)...
    taskkill /PID %SERVER_PID% /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)
goto start_bg

:: --- Node.js (foreground) -------------------------------------
:node
if "%NODE_OK%"=="0" (
    echo.
    echo  [ERROR] Node.js not found. Install it first ^(option 11^).
    echo.
    pause
    goto main
)
echo.
echo  Starting Node.js server on port %PORT%...
echo  URL: http://localhost:%PORT%/
echo  Press Ctrl+C to stop.
echo.
node "%~dp0server.js"
pause
goto main

:: --- PHP (foreground) -----------------------------------------
:php
if "%PHP_OK%"=="0" (
    echo.
    echo  [ERROR] PHP not found. Install it first ^(option 11^).
    echo.
    pause
    goto main
)
echo.
echo  Starting PHP server on port %PORT%...
echo  URL: http://localhost:%PORT%/
echo  Press Ctrl+C to stop.
echo.
php -S 0.0.0.0:%PORT% -t "%CD%"
pause
goto main

:: --- Python (foreground) --------------------------------------
:python
if "%PY_OK%"=="0" (
    echo.
    echo  [ERROR] Python not found. Install it first ^(option 11^).
    echo.
    pause
    goto main
)
echo.
echo  Starting Python server on port %PORT%...
echo  URL: http://localhost:%PORT%/
echo  Press Ctrl+C to stop.
echo.
python -m http.server %PORT% --bind 0.0.0.0
pause
goto main

:: --- IIS ------------------------------------------------------
:iis
where iisreset >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] IIS not installed.
    echo  Enable it via: Control Panel -^> Programs -^> Turn Windows features on
    echo  Check: Internet Information Services
    echo.
    pause
    goto main
)
echo.
echo  Starting IIS...
iisreset /start
echo  [OK] IIS started.
pause
goto main

:: --- Network Server (LAN) -------------------------------------
:network
echo.
echo  === Network Server Mode ===
echo.
call :show_ips
echo.
echo  Choose runtime for LAN server:
echo    1. Node.js
echo    2. PHP
echo    3. Python
echo    4. Back
echo.
set /p "NCHOICE=Select: "
if "%NCHOICE%"=="1" goto net_node
if "%NCHOICE%"=="2" goto net_php
if "%NCHOICE%"=="3" goto net_python
goto main

:net_node
if "%NODE_OK%"=="0" (
    echo  [ERROR] Node.js not found.
    pause
    goto network
)
echo.
echo  Starting Node.js on 0.0.0.0:%PORT% ...
echo  Access from LAN using one of the IPs above.
echo  Press Ctrl+C to stop.
echo.
set "HOST=0.0.0.0"
node "%~dp0server.js"
pause
goto main

:net_php
if "%PHP_OK%"=="0" (
    echo  [ERROR] PHP not found.
    pause
    goto network
)
echo.
echo  Starting PHP on 0.0.0.0:%PORT% ...
echo  Access from LAN using one of the IPs above.
echo  Press Ctrl+C to stop.
echo.
php -S 0.0.0.0:%PORT% -t "%CD%"
pause
goto main

:net_python
if "%PY_OK%"=="0" (
    echo  [ERROR] Python not found.
    pause
    goto network
)
echo.
echo  Starting Python on 0.0.0.0:%PORT% ...
echo  Access from LAN using one of the IPs above.
echo  Press Ctrl+C to stop.
echo.
python -m http.server %PORT% --bind 0.0.0.0
pause
goto main

:: --- Check dependencies ---------------------------------------
:check
cls
echo.
echo  === Installed Runtimes ===
echo.
call :detect_node
call :detect_php
call :detect_python
call :detect_winget
echo.
echo  === Port %PORT% Status ===
call :is_running
if "%SERVER_RUNNING%"=="1" (
    echo  Port %PORT% is IN USE ^(PID %SERVER_PID%^)
) else (
    echo  Port %PORT% is FREE
)
echo.
pause
goto main

:: --- Install/Uninstall menu -----------------------------------
:install_menu
cls
echo.
echo  === Install / Uninstall Runtimes ===
echo.
echo    1. Install Node.js ^(Latest LTS^)
echo    2. Uninstall Node.js
echo    3. Install Python ^(Latest^)
echo    4. Uninstall Python
echo    5. Install PHP ^(Latest^)
echo    6. Uninstall PHP
echo    7. Back to main menu
echo.
set /p "ICHOICE=Select: "
if "%ICHOICE%"=="1" goto inst_node
if "%ICHOICE%"=="2" goto uninst_node
if "%ICHOICE%"=="3" goto inst_python
if "%ICHOICE%"=="4" goto uninst_python
if "%ICHOICE%"=="5" goto inst_php
if "%ICHOICE%"=="6" goto uninst_php
if "%ICHOICE%"=="7" goto main
goto install_menu

:: --- Install Node.js ------------------------------------------
:inst_node
echo.
echo  Installing Node.js LTS...
if "%WINGET_OK%"=="1" (
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
) else (
    echo  winget not available. Opening download page...
    start https://nodejs.org/en/download
)
pause
call :check_deps
goto install_menu

:: --- Uninstall Node.js ----------------------------------------
:uninst_node
echo.
echo  Uninstalling Node.js...
if "%WINGET_OK%"=="1" (
    winget uninstall OpenJS.NodeJS.LTS
) else (
    echo  winget not found. Uninstall via Settings -^> Apps -^> Node.js
)
pause
call :check_deps
goto install_menu

:: --- Install Python -------------------------------------------
:inst_python
echo.
echo  Installing Python...
if "%WINGET_OK%"=="1" (
    winget install Python.Python.3.13 --accept-source-agreements --accept-package-agreements
) else (
    echo  winget not available. Opening download page...
    start https://www.python.org/downloads/
)
pause
call :check_deps
goto install_menu

:: --- Uninstall Python -----------------------------------------
:uninst_python
echo.
echo  Uninstalling Python...
if "%WINGET_OK%"=="1" (
    winget uninstall Python.Python.3.13
) else (
    echo  winget not found. Uninstall via Settings -^> Apps -^> Python
)
pause
call :check_deps
goto install_menu

:: --- Install PHP ----------------------------------------------
:inst_php
echo.
echo  Installing PHP...
if "%WINGET_OK%"=="1" (
    winget install PHP.PHP.8.4 --accept-source-agreements --accept-package-agreements
) else (
    echo  winget not available. Opening download page...
    start https://windows.php.net/download/
)
pause
call :check_deps
goto install_menu

:: --- Uninstall PHP --------------------------------------------
:uninst_php
echo.
echo  Uninstalling PHP...
if "%WINGET_OK%"=="1" (
    winget uninstall PHP.PHP.8.4
) else (
    echo  winget not found. Uninstall via Settings -^> Apps -^> PHP
)
pause
call :check_deps
goto install_menu

:: --- Network info ---------------------------------------------
:netinfo
cls
echo.
echo  === Network Information ===
echo.
call :show_ips
echo.
echo  === Firewall Note ===
echo  If LAN access fails, allow the port ^(run as admin^):
echo    netsh advfirewall firewall add rule name="WebServer-%PORT%" dir=in action=allow protocol=TCP localport=%PORT%
echo.
pause
goto main

:: --- Show IP addresses ----------------------------------------
:show_ips
echo  Machine name: %COMPUTERNAME%
echo.
echo  IPv4 Addresses:
ipconfig | findstr /C:"IPv4" | findstr /C:"Address"
echo.
echo  To access from another device on the same network:
echo    http://^<LAN-IP^>:%PORT%/
exit /b 0

:: --- Is server running? ---------------------------------------
:is_running
set "SERVER_RUNNING=0"
set "SERVER_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "SERVER_PID=%%p"
    set "SERVER_RUNNING=1"
)
exit /b 0

:: --- Find PID on port -----------------------------------------
:find_pid
set "SERVER_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "SERVER_PID=%%p"
)
exit /b 0

:: --- Dependency detection -------------------------------------
:check_deps
call :detect_node
call :detect_php
call :detect_python
call :detect_winget
exit /b 0

:detect_node
set "NODE_OK=0"
where node >nul 2>&1
if %ERRORLEVEL%==0 (
    for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
    set "NODE_OK=1"
) else (
    set "NODE_VER=not found"
)
exit /b 0

:detect_php
set "PHP_OK=0"
where php >nul 2>&1
if %ERRORLEVEL%==0 (
    for /f "tokens=*" %%v in ('php --version 2^>nul') do set "PHP_VER=%%v"
    set "PHP_VER=!PHP_VER:~0,30!"
    set "PHP_OK=1"
) else (
    set "PHP_VER=not found"
)
exit /b 0

:detect_python
set "PY_OK=0"
where python >nul 2>&1
if %ERRORLEVEL%==0 (
    for /f "tokens=*" %%v in ('python --version 2^>nul') do set "PY_VER=%%v"
    set "PY_OK=1"
) else (
    set "PY_VER=not found"
)
exit /b 0

:detect_winget
set "WINGET_OK=0"
where winget >nul 2>&1
if %ERRORLEVEL%==0 (
    set "WINGET_OK=1"
    set "WINGET_VER=available"
) else (
    set "WINGET_VER=not found"
)
exit /b 0
