@echo off
echo Starting RentApp Server and Client...

echo.
echo Starting Server...
start "RentApp Server" cmd /k "cd server && node index.js"

echo.
echo Starting Client...
start "RentApp Client" cmd /k "cd client && npm start"

echo.
echo Both applications are starting...
echo Server will be available at: http://localhost:5000
echo Client will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul 