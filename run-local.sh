#!/bin/bash
# Simple script to run local web server for hurricane dashboard
# This avoids CORS issues when testing locally

echo "Starting local web server for Hurricane Dashboard V2..."
echo "Dashboard will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python web server
python3 -m http.server 8000

# Alternative if Python 3 not available:
# python -m http.server 8000