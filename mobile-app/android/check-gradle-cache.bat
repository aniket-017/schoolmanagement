@echo off
echo Checking Gradle cache status...
echo.

echo Gradle User Home: %USERPROFILE%\.gradle
if exist "%USERPROFILE%\.gradle\wrapper\dists" (
    echo ✓ Gradle wrapper cache directory exists
    dir "%USERPROFILE%\.gradle\wrapper\dists" /b
) else (
    echo ✗ Gradle wrapper cache directory not found
)

echo.
echo Gradle daemon status:
gradlew --stop
gradlew --status

echo.
echo Running Gradle with cache verification...
gradlew --version --info

echo.
echo Cache check complete!
pause 