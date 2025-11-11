#!/bin/bash

# Vercel Deployment Script
# This script helps deploy to Vercel and set up Vercel Postgres

set -e

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""

# Check if logged in
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(vercel whoami)"
echo ""

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
    echo "📦 Linking project to Vercel..."
    vercel link --yes
    echo "✅ Project linked"
else
    echo "✅ Project already linked"
fi

echo ""
echo "📊 Vercel Postgres Setup"
echo "========================"
echo ""
echo "Vercel Postgres needs to be created through the Vercel Dashboard:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project: pumpneetme"
echo "3. Go to Storage → Create Database → Postgres"
echo "4. Name it: pumpneetme-db"
echo "5. Copy the connection strings (POSTGRES_URL, etc.)"
echo ""
echo "After creating the database, you'll get environment variables like:"
echo "  - POSTGRES_URL"
echo "  - POSTGRES_PRISMA_URL"
echo "  - POSTGRES_URL_NON_POOLING"
echo ""
read -p "Press Enter after you've created the database and copied the connection strings..."

echo ""
echo "🔧 Setting up environment variables..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOF
# Dune API
DUNE_API_KEY=your_dune_api_key_here
DUNE_QUERY_HOLDERS=6035701
DUNE_QUERY_GFF_INVESTMENT=6033699
DUNE_QUERY_CURRENT_VALUE_BY_TOKEN=6039732

# Vercel Postgres (from dashboard)
POSTGRES_URL=postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb
DATABASE_URL=postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb

# Optional
SYNC_SECRET_TOKEN=your_secret_token_here
EOF
    echo "✅ Created .env.local template"
    echo ""
    echo "Please update .env.local with your actual values:"
    echo "  1. DUNE_API_KEY"
    echo "  2. POSTGRES_URL (from Vercel dashboard)"
    echo "  3. DATABASE_URL (same as POSTGRES_URL)"
    echo ""
    read -p "Press Enter after updating .env.local..."
fi

# Pull environment variables from Vercel
echo "📥 Pulling environment variables from Vercel..."
vercel env pull .env.vercel 2>/dev/null || echo "⚠️  No environment variables found in Vercel yet"

echo ""
echo "📋 Adding environment variables to Vercel..."
echo ""

# Add environment variables
if [ -f .env.local ]; then
    source .env.local
    
    # Add DUNE_API_KEY
    if [ ! -z "$DUNE_API_KEY" ] && [ "$DUNE_API_KEY" != "your_dune_api_key_here" ]; then
        echo "Adding DUNE_API_KEY..."
        echo "$DUNE_API_KEY" | vercel env add DUNE_API_KEY production preview development 2>/dev/null || echo "  (may already exist)"
    fi
    
    # Add DATABASE_URL
    if [ ! -z "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb" ]; then
        echo "Adding DATABASE_URL..."
        echo "$DATABASE_URL" | vercel env add DATABASE_URL production preview development 2>/dev/null || echo "  (may already exist)"
    fi
    
    # Add query IDs
    echo "6035701" | vercel env add DUNE_QUERY_HOLDERS production preview development 2>/dev/null || echo "  (may already exist)"
    echo "6033699" | vercel env add DUNE_QUERY_GFF_INVESTMENT production preview development 2>/dev/null || echo "  (may already exist)"
    echo "6039732" | vercel env add DUNE_QUERY_CURRENT_VALUE_BY_TOKEN production preview development 2>/dev/null || echo "  (may already exist)"
fi

echo ""
echo "📊 Database Migration"
echo "===================="
echo ""
echo "To migrate your existing database to Vercel Postgres:"
echo ""
echo "1. Update .env.local with:"
echo "   SOURCE_DATABASE_URL=your_current_database_url"
echo "   VERCEL_POSTGRES_URL=your_vercel_postgres_url"
echo ""
echo "2. Run: npm run migrate"
echo ""
read -p "Press Enter to continue with deployment (you can migrate later)..."

echo ""
echo "🏗️  Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run database migration: npm run migrate"
echo "2. Trigger initial sync: curl -X POST https://your-project.vercel.app/api/sync"
echo "3. Verify data is loading correctly"
echo ""

