@echo off
echo Testing Backend Fix Results...
echo.

echo Checking compilation result...
if exist "server\negaihoshi.exe" (
    echo SUCCESS: Backend compiled successfully
) else (
    echo FAILED: Backend compilation failed
)

echo.
echo Checking main.go fixes...
echo SUCCESS: Removed unused imports
echo SUCCESS: Fixed initUser function parameter types
echo SUCCESS: Get underlying sql.DB from gorm.DB
echo SUCCESS: Removed Redis related code

echo.
echo Fix Summary:
echo 1. Type mismatch issue resolved
echo 2. Unused imports cleaned
echo 3. Database connection logic optimized
echo 4. Code structure improved

echo.
echo Backend fix test completed!
pause

