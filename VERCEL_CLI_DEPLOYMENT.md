# Vercel CLI Deployment Guide

This guide will help you deploy to Vercel using the CLI and set up Vercel Postgres.

## Prerequisites

1. **Vercel CLI installed**: `npm i -g vercel` (already installed ✓)
2. **Vercel account**: Sign up at [vercel.com](https://vercel.com)
3. **Current database**: Your existing PostgreSQL database with data

## Step 1: Login to Vercel

```bash
vercel login
```

## Step 2: Link Your Project

```bash
vercel link
```

This will:
- Ask you to create a new project or link to an existing one
- Create a `.vercel` folder with project configuration

## Step 3: Create Vercel Postgres Database

```bash
vercel postgres create pumpneetme-db
```

This will:
- Create a new Postgres database
- Output connection strings (save these!)
- Add environment variables to your project

The output will look like:
```
✅ Created Postgres database "pumpneetme-db"

Connection string:
POSTGRES_URL=postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb

Environment variables added to your project:
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
```

## Step 4: Set Environment Variables

Add your Dune API key and other environment variables:

```bash
vercel env add DUNE_API_KEY
# Enter your Dune API key when prompted

vercel env add DUNE_QUERY_HOLDERS
# Enter: 6035701

vercel env add DUNE_QUERY_GFF_INVESTMENT
# Enter: 6033699

vercel env add DUNE_QUERY_CURRENT_VALUE_BY_TOKEN
# Enter: 6039732

# Optional: For manual sync
vercel env add SYNC_SECRET_TOKEN
# Enter a random secret token
```

Or add all at once by editing `.env.local` and then:

```bash
vercel env pull .env.vercel
# Then manually add the variables via Vercel dashboard
```

## Step 5: Migrate Database Schema

First, get your Vercel Postgres connection string:

```bash
vercel env pull .env.vercel
```

Then run the schema:

```bash
# Using psql (if installed)
psql $POSTGRES_URL < database/schema.sql

# Or using the Vercel CLI
vercel postgres connect pumpneetme-db
# Then paste the contents of database/schema.sql
```

## Step 6: Migrate Data from Current Database

Update your `.env.local` with:

```env
# Your current database (source)
SOURCE_DATABASE_URL=postgresql://user:pass@host:5432/db

# Vercel Postgres (target)
VERCEL_POSTGRES_URL=postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb
```

Then run the migration:

```bash
npm run migrate
```

This will:
- Copy all data from your current database to Vercel Postgres
- Verify the migration was successful

## Step 7: Update DATABASE_URL

After migration, update Vercel environment variables to use Vercel Postgres:

```bash
# The POSTGRES_URL is already set, but we need to set DATABASE_URL
vercel env add DATABASE_URL
# Enter the same value as POSTGRES_URL
```

Or set it directly:

```bash
vercel env ls
# Copy the POSTGRES_URL value
vercel env add DATABASE_URL production
# Paste the POSTGRES_URL value
```

## Step 8: Deploy to Vercel

```bash
vercel --prod
```

This will:
- Build your Next.js application
- Deploy to production
- Set up cron jobs automatically (from vercel.json)

## Step 9: Verify Deployment

1. **Check your deployment URL**: `https://your-project.vercel.app`
2. **Verify data is loading**: Check that metrics, chart, and holders are displaying
3. **Check cron jobs**: Go to Vercel Dashboard → Your Project → Cron Jobs
4. **Test sync endpoint**: 
   ```bash
   curl https://your-project.vercel.app/api/sync
   ```

## Step 10: Run Initial Sync

After deployment, trigger the first sync to ensure data is fresh:

```bash
curl -X POST https://your-project.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

Or wait for the cron job to run (every 6 hours).

## Troubleshooting

### Database Connection Issues

```bash
# Test Vercel Postgres connection
vercel postgres connect pumpneetme-db

# Check environment variables
vercel env ls
```

### Migration Issues

If migration fails:
1. Check both database URLs are correct
2. Ensure source database is accessible
3. Verify schema exists in target database

### Deployment Issues

```bash
# View deployment logs
vercel logs

# Check function logs
vercel logs --follow
```

## Environment Variables Reference

After setup, your Vercel project should have:

- `DATABASE_URL` - Vercel Postgres connection string
- `POSTGRES_URL` - Same as DATABASE_URL (Vercel standard)
- `DUNE_API_KEY` - Your Dune API key
- `DUNE_QUERY_HOLDERS` - 6035701
- `DUNE_QUERY_GFF_INVESTMENT` - 6033699
- `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` - 6039732
- `SYNC_SECRET_TOKEN` - Optional, for manual sync

## Next Steps

1. ✅ Database migrated to Vercel Postgres
2. ✅ Application deployed
3. ✅ Cron jobs configured
4. 🔄 Data syncs every 6 hours automatically
5. 📊 All API calls now read from database (no direct Dune API calls)

## Useful Commands

```bash
# View project info
vercel inspect

# View environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.vercel

# View logs
vercel logs

# Connect to database
vercel postgres connect pumpneetme-db

# Deploy preview
vercel

# Deploy production
vercel --prod
```

