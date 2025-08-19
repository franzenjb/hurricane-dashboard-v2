#!/bin/bash

# Setup script for AI Hurricane Assistant with secure API key

echo "🌀 Hurricane AI Assistant Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Anthropic API key"
    echo "   Run: nano .env"
    echo "   Add: ANTHROPIC_API_KEY=sk-ant-api-..."
    echo ""
else
    echo "✅ .env file exists"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install express cors
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if API key is set
if [ -f .env ]; then
    if grep -q "sk-ant-api-" .env; then
        echo "✅ API key found in .env"
        
        # Start the backend
        echo ""
        echo "🚀 Starting AI backend server..."
        echo "   The server will run at http://localhost:3001"
        echo "   Keep this terminal open!"
        echo ""
        echo "📍 In another terminal, run:"
        echo "   ./run-local.sh"
        echo ""
        echo "Then open: http://localhost:8000"
        echo ""
        
        # Load .env and start server
        export $(cat .env | grep -v '^#' | xargs)
        node ai-backend.js
    else
        echo ""
        echo "⚠️  No API key found in .env"
        echo ""
        echo "To add your key:"
        echo "1. Edit .env file"
        echo "2. Replace 'sk-ant-api-your-key-here' with your actual key"
        echo "3. Run this script again"
        echo ""
        echo "Get your key from: https://console.anthropic.com/"
    fi
else
    echo "❌ No .env file found"
fi