# Neon PostgreSQL Setup Guide

Neon is a perfect choice for serverless PostgreSQL! It works seamlessly with Vercel and is optimized for serverless environments.

## Why Neon?

✅ **Serverless**: Auto-scales to zero when not in use  
✅ **Fast**: Optimized for serverless functions  
✅ **Free Tier**: Generous free tier for development  
✅ **Vercel Integration**: Works perfectly with Vercel deployments  
✅ **Branching**: Database branching for testing (like Git branches!)  

## Step 1: Create Neon Database

1. **Sign up**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Project**: Click "Create Project"
3. **Choose Region**: Select a region close to your users (or Vercel's region)
4. **Copy Connection String**: You'll get a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Create Database Schema

**Option A: Using Neon Dashboard**
1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Paste the contents of `database/schema.sql`
4. Click "Run"

**Option B: Using psql**
```bash
psql "YOUR_NEON_CONNECTION_STRING" < database/schema.sql
```

## Step 3: Migrate Data from Local Database

Update your `.env.local`:

```env
# Your current local database (source)
SOURCE_DATABASE_URL=postgresql://felirami@localhost:5432/pumpneetme?sslmode=disable

# Neon database (target)
NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Then run the migration:

```bash
npm run migrate
```

This will copy all your data from the local database to Neon.

## Step 4: Set Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `DATABASE_URL` = (your Neon connection string)
- `DUNE_API_KEY` = `ghOT62WjPTsZXkir6R0kZud2kGEXao2N`
- `DUNE_QUERY_HOLDERS` = `6035701`
- `DUNE_QUERY_GFF_INVESTMENT` = `6033699`
- `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` = `6039732`

**Optional:**
- `SYNC_SECRET_TOKEN` = (generate a random string for manual sync)

## Step 5: Deploy to Vercel

```bash
vercel --prod
```

## Step 6: Verify Deployment

1. **Check your site**: `https://pumpneetme.vercel.app`
2. **Verify data**: Check that metrics, chart, and holders are displaying
3. **Check cron jobs**: Vercel Dashboard → Cron Jobs
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

## Neon Connection String Format

Neon provides different connection strings:

- **Pooled Connection** (recommended for serverless): `postgresql://user:pass@ep-xxx.pooler.supabase.com/neondb?sslmode=require`
- **Direct Connection**: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

For Vercel/serverless, use the **pooled connection** if available (better for connection pooling).

## SSL Configuration

The app automatically detects Neon URLs and configures SSL correctly. No manual SSL configuration needed!

## Troubleshooting

### Connection Issues
- Ensure `DATABASE_URL` is set correctly in Vercel
- Check that SSL is enabled (`sslmode=require` in connection string)
- Verify the database is accessible (not paused)

### Migration Issues
- Verify both database URLs are correct
- Ensure source database is accessible
- Check schema was created in Neon database

### Neon-Specific Tips
- **Auto-pause**: Neon auto-pauses databases after inactivity (free tier). First request may take a few seconds to wake up.
- **Connection Pooling**: Use pooled connections for better performance
- **Branching**: Create branches for testing without affecting production

## Summary

✅ Neon is perfect for serverless PostgreSQL  
✅ Works seamlessly with Vercel  
✅ Auto-scales and cost-effective  
✅ Database connection code already supports Neon  

**Next**: Create Neon database, run migration, and deploy!

