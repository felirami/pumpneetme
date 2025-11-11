# Vercel Deployment Guide

This document provides step-by-step instructions for deploying to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **PostgreSQL Database**: Set up a cloud database (Supabase, Neon, Railway, etc.)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Set Up PostgreSQL Database

Choose a provider and create a database:

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (it will look like: `postgresql://postgres:[password]@[host]:5432/postgres`)
5. Run the schema: Go to SQL Editor and paste the contents of `database/schema.sql`

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run the schema using their SQL editor

### 3. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 4. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

**Required:**
- `DUNE_API_KEY` - Your Dune Analytics API key
- `DATABASE_URL` - Your PostgreSQL connection string
- `DUNE_QUERY_HOLDERS` - `6035701`
- `DUNE_QUERY_GFF_INVESTMENT` - `6033699`
- `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` - `6039732`

**Optional (for manual sync):**
- `SYNC_SECRET_TOKEN` - A random secret token for manual sync calls
- `DUNE_QUERY_METRICS` - Your metrics query ID (if different)
- `DUNE_QUERY_CHART` - Your chart query ID (if different)
- `DUNE_QUERY_TRANSACTIONS` - Your transactions query ID (if different)

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be live at `your-project.vercel.app`

### 6. Run Initial Database Sync

After deployment, trigger the first sync to populate your database:

**Option A: Using curl**
```bash
curl -X POST https://your-project.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

**Option B: Using Vercel Dashboard**
1. Go to your project → Functions
2. Find `/api/sync`
3. Click "Invoke" → "POST"

**Option C: Wait for Cron Job**
The cron job will automatically run every 6 hours, but you can trigger it manually first.

### 7. Verify Cron Jobs

1. Go to your Vercel project → Settings → Cron Jobs
2. You should see a cron job configured for `/api/sync` running every 6 hours
3. Check the logs to ensure it's running successfully

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **Check DATABASE_URL**: Ensure it's correctly set in Vercel environment variables
2. **SSL Configuration**: The app automatically handles SSL for cloud databases
3. **Firewall**: Ensure your database allows connections from Vercel's IP ranges

### Cron Job Not Running

1. **Check vercel.json**: Ensure the cron configuration is correct
2. **Check Logs**: Go to Vercel → Functions → `/api/sync` → Logs
3. **Verify Schedule**: Cron jobs run at 00:00, 06:00, 12:00, 18:00 UTC

### Sync Errors

1. **Check Dune API Key**: Ensure `DUNE_API_KEY` is valid
2. **Check Query IDs**: Verify all query IDs are correct
3. **Check Logs**: Review function logs in Vercel dashboard
4. **Rate Limiting**: The sync has a 5-minute rate limit between calls

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DUNE_API_KEY` | Dune Analytics API key | `abc123...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DUNE_QUERY_HOLDERS` | Holders query ID | `6035701` |
| `DUNE_QUERY_GFF_INVESTMENT` | GFF Investment query ID | `6033699` |
| `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` | Chart query ID | `6039732` |
| `SYNC_SECRET_TOKEN` | Secret for manual sync (optional) | `your-secret-token` |

## Post-Deployment Checklist

- [ ] Database schema is created
- [ ] All environment variables are set
- [ ] Initial sync completed successfully
- [ ] Cron job is configured and running
- [ ] Website is accessible and displaying data
- [ ] API endpoints are working (`/api/metrics`, `/api/chart`, `/api/holders`)

## Support

For issues or questions:
1. Check Vercel function logs
2. Check database connection
3. Verify environment variables
4. Review the README.md for local setup troubleshooting

