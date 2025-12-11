#!/bin/bash
echo "Starting Novel Reader Webapp..."
echo ""
echo "Backend API will run on port 5000"
echo "Webapp will be accessible at http://localhost:5000"
echo ""
cd "$(dirname "$0")/../backend"
python3 app.py &
sleep 2
echo ""
echo "Webapp is running!"
echo "Open http://localhost:5000 in your browser"
echo ""

