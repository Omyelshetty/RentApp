@echo off
echo Starting RentApp Server and Client...
echo.

echo Checking if MongoDB is running...
echo If you see connection errors, please install and start MongoDB
echo Download from: https://docs.mongodb.com/manual/installation/
echo.

echo Starting Server...
start "RentApp Server" cmd /k "cd server && node index.js"

echo.
echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Client...
start "RentApp Client" cmd /k "cd client && npm start"

echo.
echo Both applications are starting...
echo Server will be available at: http://localhost:5000
echo Client will be available at: http://localhost:3000
echo.
echo Health check: http://localhost:5000/api/health
echo.
echo Demo Accounts:
echo - Admin: admin@rentapp.com / admin123
echo - User: user@rentapp.com / user123
echo.
echo Press any key to close this window...
pause > nul 