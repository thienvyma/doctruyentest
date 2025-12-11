@echo off
echo Starting Novel Reader Webapp...
echo.
echo Backend API will run on port 5000
echo Webapp will be accessible at http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.
cd /d %~dp0
cd ..\backend
start "Backend API" python app.py
timeout /t 3
echo.
echo Webapp is running!
echo Open http://localhost:5000 in your browser
echo.
pause

