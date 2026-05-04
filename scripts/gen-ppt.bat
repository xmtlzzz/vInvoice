@echo off
cd /d "%~dp0"
cd ..

echo ============================================
echo   vInvoice PPTX Generator
echo ============================================
echo.

:: Check pptxgenjs
node -e "require('pptxgenjs')" >nul 2>&1
if errorlevel 1 (
    echo [!] pptxgenjs not found, installing...
    npm install pptxgenjs
    if errorlevel 1 (
        echo [X] Failed to install pptxgenjs
        pause
        exit /b 1
    )
)

echo [*] Generating PPTX...
node scripts/gen-ppt.js

if errorlevel 1 (
    echo [X] Generation failed
) else (
    echo [OK] vInvoice-intro.pptx generated in project root
)

echo.
pause
