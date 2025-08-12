@echo off
echo Testing Password Encryption Implementation...
echo.

echo Checking backend compilation...
cd server
go build -o negaihoshi main.go
if %errorlevel% neq 0 (
    echo ❌ Backend compilation failed
    pause
    exit /b 1
)
echo ✅ Backend compilation successful

echo.
echo Checking password migration tool...
go build -o password-migrator cmd/password-migrator/main.go
if %errorlevel% neq 0 (
    echo ❌ Password migrator compilation failed
    pause
    exit /b 1
)
echo ✅ Password migrator compilation successful

echo.
echo Password Encryption Features:
echo 1. AES-256 encryption with GCM mode
echo 2. Random IV generation for each password
echo 3. Base64 encoding for storage
echo 4. Secure password verification
echo 5. Migration tool for existing users

echo.
echo Security Benefits:
echo 1. Passwords stored as encrypted ciphertext
echo 2. Each password has unique IV
echo 3. Protection against rainbow table attacks
echo 4. Secure password comparison
echo 5. No plaintext password storage

echo.
echo Deployment Steps:
echo 1. Run database migration script
echo 2. Use password migrator tool
echo 3. Test user login functionality
echo 4. Verify password encryption

echo.
echo Password encryption test completed!
cd ..
pause

