# Quick Vercel Deployment Guide

# Quick Vercel Deployment Guide

## Database Options

You can use either:
- **Neon** (Recommended): Serverless PostgreSQL - [Setup Guide](./NEON_SETUP.md)
- **Vercel Postgres**: Native Vercel integration
- **Supabase**: Free PostgreSQL hosting

This guide covers Vercel Postgres, but Neon is recommended for better serverless performance.

## Step 1: Create Database

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. See [NEON_SETUP.md](./NEON_SETUP.md) for detailed instructions

**Option B: Vercel Postgres**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `pumpneetme`
3. Go to Storage → Create Database → Postgres
4. Name it: `pumpneetme-db`
5. Copy the connection strings

## Step 2: Set Environment Variables in Vercel

Add these via Vercel Dashboard → Your Project → Settings → Environment Variables:

**Required:**
- `DATABASE_URL` = (your Neon or Postgres connection string)
- `DUNE_API_KEY` = `ghOT62WjPTsZXkir6R0kZud2kGEXao2N` (already have this)
- `DUNE_QUERY_HOLDERS` = `6035701`
- `DUNE_QUERY_GFF_INVESTMENT` = `6033699`
- `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` = `6039732`

**Optional:**
- `SYNC_SECRET_TOKEN` = (generate a random string for manual sync)
- `POSTGRES_URL` = (same as DATABASE_URL, for Vercel Postgres)

## Step 3: Create Database Schema

Run the schema on your database:

**Option A: Using Neon Dashboard**
1. Go to Neon project → SQL Editor
2. Paste contents of `database/schema.sql`
3. Run it

**Option B: Using Vercel Dashboard** (for Vercel Postgres)
1. Go to Storage → Your Database → Connect
2. Use the SQL Editor
3. Paste contents of `database/schema.sql`
4. Run it

**Option C: Using psql**
```bash
psql "YOUR_DATABASE_URL" < database/schema.sql
```

## Step 4: Migrate Data from Local Database

Update `.env.local`:

```env
# Your current local database (source)
SOURCE_DATABASE_URL=postgresql://felirami@localhost:5432/pumpneetme?sslmode=disable

# Neon or Vercel Postgres (target)
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
# OR for Vercel Postgres:
# VERCEL_POSTGRES_URL=postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb
```

Then run migration:

```bash
npm run migrate
```

This will copy all your data from local database to Vercel Postgres.

## Step 5: Deploy to Vercel

```bash
vercel --prod
```

Or use the deployment script:

```bash
./scripts/deploy-vercel.sh
```

## Step 6: Verify Deployment

1. **Check your site**: `https://pumpneetme.vercel.app` (or your custom domain)
2. **Verify data**: Check that metrics, chart, and holders are displaying
3. **Check cron jobs**: Vercel Dashboard → Cron Jobs (should auto-configure from vercel.json)
4. **Test sync**: 
   ```bash
   curl https://your-project.vercel.app/api/sync
   ```

## Step 7: Run Initial Sync

After deployment, trigger the first sync:

```bash
curl -X POST https://your-project.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

Or wait for the cron job (runs every 6 hours).

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` and `POSTGRES_URL` are set in Vercel
- Check SSL configuration (should auto-detect for Vercel Postgres)

### Migration Issues
- Verify both database URLs are correct
- Ensure source database is accessible
- Check schema was created in target database

### Deployment Issues
```bash
# View logs
vercel logs

# Check environment variables
vercel env ls
```

## Summary

✅ Project linked to Vercel  
✅ Ready to create Vercel Postgres  
✅ Migration script ready (`npm run migrate`)  
✅ Deployment ready (`vercel --prod`)  

**Next**: Create Vercel Postgres via dashboard, then run migration and deploy!

