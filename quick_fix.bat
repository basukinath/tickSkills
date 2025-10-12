@echo off
REM Quick fix batch script for Windows
REM Run this to make slug columns nullable

echo ====================================
echo   Quick Fix: Make Slug Nullable
echo ====================================
echo.

set /p username="Enter MySQL username (default: root): " || set username=root
set /p database="Enter database name (default: tickskills): " || set database=tickskills

echo.
echo Connecting to MySQL...
echo Running: mysql -u %username% -p %database% < make_slug_nullable.sql
echo.

mysql -u %username% -p %database% < make_slug_nullable.sql

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Slug columns are now nullable!
    echo.
    echo Next steps:
    echo 1. Restart your Spring Boot application
    echo 2. Clear browser cache (Ctrl+Shift+R^)
    echo 3. Try creating a question - should work now!
) else (
    echo.
    echo [ERROR] Failed to execute SQL script
    echo Please run the SQL manually in MySQL Workbench
)

echo.
pause
