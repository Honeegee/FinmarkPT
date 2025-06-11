#!/bin/bash

echo "🚀 Starting FinMark E-commerce Development Server..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .next exists, if not, do a development build
if [ ! -d ".next" ]; then
    echo "🔨 Building for development..."
    npm run build
    echo ""
fi

echo "✅ All dependencies ready!"
echo ""
echo "🌐 Starting development server..."
echo "📍 URL: http://localhost:3000"
echo ""
echo "🔧 UI Enhancements Applied:"
echo "   - Fixed text and button visibility"
echo "   - Enhanced all pages with proper components"
echo "   - Uniform design system"
echo "   - Responsive layouts"
echo ""

# Start the development server
npm run dev