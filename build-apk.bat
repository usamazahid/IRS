@echo off
setlocal enabledelayedexpansion

REM IRS System - APK Build Script for Windows
REM This script builds a release APK for the IRS (Incident Reporting System) app

echo ======================================
echo   IRS System - APK Build Script
echo ======================================
echo.

REM Default values from .env
set DEFAULT_API_IP=10.0.2.2
set DEFAULT_API_KEY=your-api-key
set DEFAULT_API_PORT=8080
set DEFAULT_API_BASE_URL=http://0.0.0.0:8080

REM Read existing .env file if it exists
if exist ".env" (
    echo [32mFound existing .env file[0m
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        set %%a=%%b
    )
) else (
    echo [33mNo .env file found. Will create one.[0m
)

REM Configure environment variables
echo.
echo ======================================
echo   Environment Configuration
echo ======================================
echo.
echo Press ENTER to use default values shown in [brackets]
echo.

REM API_IP
set /p INPUT_API_IP="Enter API IP [%API_IP%] or [%DEFAULT_API_IP%]: "
if "%INPUT_API_IP%"=="" (
    if "%API_IP%"=="" (
        set API_IP=%DEFAULT_API_IP%
    )
) else (
    set API_IP=%INPUT_API_IP%
)

REM API_KEY
set /p INPUT_API_KEY="Enter API Key [%API_KEY%] or [%DEFAULT_API_KEY%]: "
if "%INPUT_API_KEY%"=="" (
    if "%API_KEY%"=="" (
        set API_KEY=%DEFAULT_API_KEY%
    )
) else (
    set API_KEY=%INPUT_API_KEY%
)

REM API_PORT
set /p INPUT_API_PORT="Enter API Port [%API_PORT%] or [%DEFAULT_API_PORT%]: "
if "%INPUT_API_PORT%"=="" (
    if "%API_PORT%"=="" (
        set API_PORT=%DEFAULT_API_PORT%
    )
) else (
    set API_PORT=%INPUT_API_PORT%
)

REM API_BASE_URL
set /p INPUT_API_BASE_URL="Enter API Base URL [%API_BASE_URL%] or [%DEFAULT_API_BASE_URL%]: "
if "%INPUT_API_BASE_URL%"=="" (
    if "%API_BASE_URL%"=="" (
        set API_BASE_URL=%DEFAULT_API_BASE_URL%
    )
) else (
    set API_BASE_URL=%INPUT_API_BASE_URL%
)

REM Write to .env file
echo.
echo [32mWriting configuration to .env file...[0m
(
    echo API_IP=%API_IP%
    echo API_KEY=%API_KEY%
    echo API_PORT=%API_PORT%
    echo API_BASE_URL=%API_BASE_URL%
) > .env
echo [32m.env file updated successfully![0m

REM Check prerequisites
echo.
echo ======================================
echo   Checking Prerequisites
echo ======================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [31mError: Node.js is not installed[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [32m✓ Node.js: %NODE_VERSION%[0m

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [31mError: npm is not installed[0m
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [32m✓ npm: %NPM_VERSION%[0m

REM Check Java
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [31mError: Java is not installed[0m
    echo Please install JDK 17 or higher
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java --version ^| findstr /R "openjdk java"') do (
    echo [32m✓ Java: %%i[0m
    goto :java_found
)
:java_found

REM Check ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    echo [33mWarning: ANDROID_HOME is not set[0m
    echo Please set ANDROID_HOME environment variable
) else (
    echo [32m✓ ANDROID_HOME: %ANDROID_HOME%[0m
)

REM Install dependencies
echo.
echo ======================================
echo   Installing Dependencies
echo ======================================
echo.

if not exist "node_modules" (
    echo [33mInstalling npm dependencies...[0m
    call npm install
    echo [32m✓ Dependencies installed[0m
) else (
    echo [32m✓ node_modules already exists[0m
    set /p REINSTALL="Do you want to reinstall dependencies? (y/N): "
    if /i "%REINSTALL%"=="y" (
        echo [33mReinstalling dependencies...[0m
        rmdir /s /q node_modules
        call npm install
        echo [32m✓ Dependencies reinstalled[0m
    )
)

REM Clean build
echo.
echo ======================================
echo   Cleaning Previous Build
echo ======================================
echo.

set /p CLEAN_BUILD="Do you want to clean previous build? (Y/n): "
if /i not "%CLEAN_BUILD%"=="n" (
    cd android
    if exist "app\build" (
        echo [33mCleaning previous build...[0m
        call gradlew.bat clean
        echo [32m✓ Build cleaned[0m
    ) else (
        echo [32m✓ No previous build to clean[0m
    )
    cd ..
)

REM Check keystore
echo.
echo ======================================
echo   Checking Keystore
echo ======================================
echo.

set KEYSTORE_PATH=android\app\android.keystore

if exist "%KEYSTORE_PATH%" (
    echo [32m✓ Keystore found at %KEYSTORE_PATH%[0m
) else (
    echo [33mKeystore not found. Generating new keystore...[0m
    
    keytool -genkeypair -v -keystore "%KEYSTORE_PATH%" -alias androidkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=IRS System, OU=Development, O=IRS, L=City, S=State, C=PK"
    
    echo [32m✓ Keystore generated successfully[0m
)

REM Display keystore info
echo.
echo Keystore Information:
keytool -list -v -keystore "%KEYSTORE_PATH%" -storepass android | findstr /C:"Alias name:" /C:"SHA1:" /C:"SHA256:"

REM Build APK
echo.
echo ======================================
echo   Building Release APK
echo ======================================
echo.

cd android

echo [33mBuilding release APK...[0m
echo This may take a few minutes...
echo.

call gradlew.bat assembleRelease

cd ..

echo.
echo [32m✓ APK built successfully![0m

REM Display APK info
echo.
echo ======================================
echo   Build Complete!
echo ======================================
echo.

set APK_PATH=android\app\build\outputs\apk\release\app-release.apk

if exist "%APK_PATH%" (
    echo [32mAPK Location:[0m %APK_PATH%
    
    for %%A in ("%APK_PATH%") do set APK_SIZE=%%~zA
    set /a APK_SIZE_MB=!APK_SIZE! / 1048576
    echo [32mAPK Size:[0m !APK_SIZE_MB! MB
    echo.
    
    REM Create a copy with timestamp
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
    
    if not exist "build_output" mkdir build_output
    set OUTPUT_APK=build_output\irsystem-release-%TIMESTAMP%.apk
    copy "%APK_PATH%" "%OUTPUT_APK%" >nul
    
    echo [32mAPK copied to:[0m %OUTPUT_APK%
    echo.
) else (
    echo [31mError: APK not found at expected location[0m
    pause
    exit /b 1
)

REM Get SHA signatures
echo.
echo ======================================
echo   SHA Signatures
echo ======================================
echo.

echo SHA-1 Signature:
keytool -list -v -keystore "%KEYSTORE_PATH%" -storepass android | findstr "SHA1:" 
echo.

echo SHA-256 Signature:
keytool -list -v -keystore "%KEYSTORE_PATH%" -storepass android | findstr "SHA256:"
echo.

echo [33mNote: These signatures are needed for:[0m
echo   - Firebase authentication
echo   - Google Maps API
echo   - Facebook SDK
echo   - Other OAuth providers
echo.

echo [32m======================================
echo   Build Process Completed Successfully!
echo ======================================[0m
echo.
echo Next steps:
echo   1. Test the APK on a device
echo   2. Upload to Google Play Console (for production)
echo   3. Distribute via internal testing channels
echo.

pause
