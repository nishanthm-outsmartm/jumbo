@echo off
echo Creating a link to the src directory...

REM Make sure dist folder exists
if not exist "client\dist\" mkdir "client\dist"

REM Copy the src directory to dist
xcopy /E /I /Y "client\src" "client\dist\src"

echo Link created successfully!
echo Please restart your server now with: npm run start
