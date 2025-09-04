#!/bin/bash
# Development script for frontend

set -e

echo "🚀 Starting PM Internship Frontend Development Server"

# Change to frontend directory
cd "$(dirname "$0")/../frontend"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export REACT_APP_API_URL=http://localhost:5000
export REACT_APP_ADMIN_API_KEY=admin123

echo "✅ Frontend setup complete!"
echo "🌐 Starting React development server on http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo ""

# Start the development server
npm start