#!/bin/bash

# Moodify Frontend - Docker Deployment Script
# This script helps you quickly deploy the Moodify application using Docker

set -e  # Exit on error

echo "🎵 Moodify Frontend - Docker Deployment Script 🎵"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env from template..."
    
    if [ -f env.example.txt ]; then
        cp env.example.txt .env
        echo "✅ Created .env file from env.example.txt"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and configure the following:"
        echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
        echo "   - NEXT_PUBLIC_SPOTIFY_CLIENT_ID (from Spotify Developer Dashboard)"
        echo "   - SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)"
        echo ""
        echo "Press Enter when you have configured the .env file..."
        read
    else
        echo "❌ env.example.txt not found. Please create a .env file manually."
        exit 1
    fi
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXT_PUBLIC_SPOTIFY_CLIENT_ID"
    "SPOTIFY_CLIENT_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""

# Check Docker and Docker Compose
echo "🐳 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo "1) Build and start containers"
echo "2) Stop containers"
echo "3) Rebuild containers (clean build)"
echo "4) View logs"
echo "5) Check container status"
echo "6) Run database migrations"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo ""
        echo "🏗️  Building and starting containers..."
        docker compose up -d --build
        echo ""
        echo "✅ Containers started successfully!"
        echo "🌐 Application is available at: http://localhost:3000"
        echo "📊 Health check: http://localhost:3000/api/health"
        echo ""
        echo "📝 To view logs, run: docker compose logs -f"
        ;;
    2)
        echo ""
        echo "🛑 Stopping containers..."
        docker compose down
        echo "✅ Containers stopped successfully!"
        ;;
    3)
        echo ""
        echo "🔄 Rebuilding containers (clean build)..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        echo ""
        echo "✅ Containers rebuilt and started successfully!"
        echo "🌐 Application is available at: http://localhost:3000"
        ;;
    4)
        echo ""
        echo "📋 Showing logs (press Ctrl+C to exit)..."
        docker compose logs -f moodify-frontend
        ;;
    5)
        echo ""
        echo "📊 Container status:"
        docker compose ps
        ;;
    6)
        echo ""
        echo "🗄️  Running database migrations..."
        docker compose exec moodify-frontend npm run db:push
        echo "✅ Database migrations completed!"
        ;;
    7)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "✅ Operation completed successfully!"
echo "=================================================="

