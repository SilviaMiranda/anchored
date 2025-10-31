#!/bin/bash

echo "🚀 Setting up Anchored - Full Stack Parenting App"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start the app:"
echo "  npm run dev     # Start both frontend and backend"
echo ""
echo "Or start separately:"
echo "  npm run backend:dev  # Backend only (port 5000)"
echo "  npm start            # Frontend only (port 3000)"
echo ""
echo "📱 App Features:"
echo "  • 30+ parenting situations with scripts"
echo "  • 18 learning modules for skill building"
echo "  • Full CRUD operations for managing situations"
echo "  • Prevention plans and technique references"
echo "  • Offline fallback when backend unavailable"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  Health Check: http://localhost:5000/api/health"
echo ""
echo "Ready to help parents stay anchored in the chaos! ⚓"



