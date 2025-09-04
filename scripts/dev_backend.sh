#!/bin/bash
# Development script for backend

set -e

echo "🚀 Starting PM Internship Backend Development Server"

# Change to backend directory
cd "$(dirname "$0")/../backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=development
export ADMIN_API_KEY=admin123
export SECRET_KEY=dev-secret-key
export DATABASE_URL=sqlite:///app.db

# Create necessary directories
mkdir -p logs models_artifacts data

# Initialize database
echo "🗄️  Initializing database..."
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database initialized!')"

echo "✅ Backend setup complete!"
echo "🌐 Starting Flask development server on http://localhost:5000"
echo "📋 Admin API Key: admin123"
echo ""

# Start the development server
python app.py