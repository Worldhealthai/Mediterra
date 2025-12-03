#!/bin/bash

# Simple script to start a local web server for Mediterra

echo "🌊 Starting Mediterra Local Web Server..."
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    echo "Server running at: http://localhost:8000"
    echo ""
    echo "📋 Quick Links:"
    echo "   Main Website: http://localhost:8000/index.html"
    echo "   Admin Panel:  http://localhost:8000/admin.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000

# Check if Python 2 is available
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    echo "Server running at: http://localhost:8000"
    echo ""
    echo "📋 Quick Links:"
    echo "   Main Website: http://localhost:8000/index.html"
    echo "   Admin Panel:  http://localhost:8000/admin.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000

else
    echo "❌ Python is not installed!"
    echo ""
    echo "Please install Python or use another method from ADMIN_SETUP.md"
    exit 1
fi
