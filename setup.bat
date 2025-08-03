@echo off
echo Setting up RentApp environment...

echo.
echo Installing root dependencies...
npm install

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
echo Installing server dependencies...
cd server
npm install

echo.
echo Creating .env file...
if not exist .env (
    echo MONGO_URI=mongodb://localhost:27017/rentapp > .env
    echo PORT=5000 >> .env
    echo JWT_SECRET=your_jwt_secret_key_here >> .env
    echo .env file created successfully!
) else (
    echo .env file already exists
)

cd ..

echo.
echo Setup complete! 
echo.
echo To start the application:
echo 1. Start MongoDB (if using local installation)
echo 2. Run: start-app.bat
echo.
echo Or start manually:
echo - Server: cd server && npm run dev
echo - Client: cd client && npm start
echo.
pause 