@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 goto node_missing

where pnpm >nul 2>&1
if not errorlevel 1 (
  set "PNPM=pnpm"
) else (
  where corepack >nul 2>&1
  if errorlevel 1 goto pnpm_missing
  set "PNPM=corepack pnpm"
)

echo Preparing dependencies...
call %PNPM% install
if errorlevel 1 goto install_failed

echo Starting the local page...
call %PNPM% dev -- --open
if errorlevel 1 goto start_failed
exit /b 0

:node_missing
echo Node.js is required. Install it from https://nodejs.org and try again.
goto failed

:pnpm_missing
echo pnpm is required. Enable Corepack or install pnpm, then try again.
goto failed

:install_failed
echo Dependency installation failed.
goto failed

:start_failed
echo The local page could not be started.

:failed
echo.
pause
exit /b 1
