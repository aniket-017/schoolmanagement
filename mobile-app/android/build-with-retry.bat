@echo off
echo Starting Android build with retry mechanism...

REM Set environment variables for better network handling
set JAVA_OPTS=-Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true
set GRADLE_OPTS=-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false

echo Attempting build with IPv4 preference...
call gradlew clean --no-daemon --max-workers=1

if %ERRORLEVEL% NEQ 0 (
    echo First attempt failed, trying with different settings...
    call gradlew clean --no-daemon --max-workers=1 --stacktrace
)

if %ERRORLEVEL% NEQ 0 (
    echo Second attempt failed, trying with debug info...
    call gradlew clean --no-daemon --max-workers=1 --info
)

echo Build process completed.
pause 