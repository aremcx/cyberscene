#!/bin/bash

# CyberVault Database Migration Script
# This script automates the migration from in-memory store to PostgreSQL

set -e

echo "🚀 CyberVault Database Migration Script"
echo "========================================"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -q 2>/dev/null; then
    echo "⚠️  PostgreSQL is not running or not accessible"
    echo "Please ensure PostgreSQL is installed and running"
    echo ""
    echo "On macOS: brew services start postgresql"
    echo "On Linux: sudo systemctl start postgresql"
    echo ""
    read -p "Press Enter to continue anyway (if PostgreSQL is running on a different host)..."
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Update DATABASE_URL in .env with your PostgreSQL credentials"
    echo "Example: DATABASE_URL=\"postgresql://postgres:password@localhost:5432/cybervault\""
    echo ""
    read -p "Press Enter after updating .env..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install @prisma/client
npm install --save-dev prisma
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Run migration
echo "🗄️  Running database migration..."
echo "This will create all tables in your PostgreSQL database"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    echo "✅ Migration completed"
else
    echo "❌ Migration cancelled"
    exit 1
fi
echo ""

# Seed database (optional)
read -p "🌱 Seed database with demo data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
    echo "✅ Database seeded"
else
    echo "⏭️  Skipping seed"
fi
echo ""

# Verify
echo "🔍 Verifying database..."
npx prisma studio &
STUDIO_PID=$!
sleep 3
echo "✅ Prisma Studio opened at http://localhost:5555"
echo "   You can view and edit data there"
echo ""

# Summary
echo "========================================"
echo "✅ Migration completed successfully!"
echo ""
echo "📊 Next steps:"
echo "   1. Review data in Prisma Studio (http://localhost:5555)"
echo "   2. Test the application: npm run dev"
echo "   3. Visit http://localhost:3000"
echo ""
echo "📝 Demo credentials (if seeded):"
echo "   Email: superadmin@cybervault.dev"
echo "   Password: Demo@1234"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm test             - Run tests"
echo "   npx prisma studio    - Open database GUI"
echo "   npx prisma migrate   - Run migrations"
echo ""
echo "Press Ctrl+C to close Prisma Studio"
wait $STUDIO_PID
