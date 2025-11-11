# Vercel Deployment Checklist

## ✅ Pre-Deployment Steps Completed

- [x] Database migration from localhost to Neon completed
- [x] All data synced to Neon database
- [x] Vercel cron job configured (every 6 hours)
- [x] No Dune API calls during deployment

## 📋 Environment Variables Required in Vercel

Set these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

### Required Variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_FicfOBGX3IJ1@ep-crimson-sea-ahrx7sqx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
DUNE_API_KEY=ghOT62WjPTsZXkir6R0kZud2kGEXao2N
DUNE_QUERY_GFF_INVESTMENT=6033699
DUNE_QUERY_CURRENT_VALUE_BY_TOKEN=6039732
```

**Note:** `DUNE_QUERY_HOLDERS` (6035701) is no longer needed - replaced by General GFF Investments (6039732).

### Optional Variables:
```
SYNC_SECRET_TOKEN=<generate-random-string-for-manual-sync>
```

## 🚀 Deployment Steps

1. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables listed above
   - Make sure `DATABASE_URL` points to Neon database

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```
   Or push to your main branch if connected to Git.

3. **Verify Deployment**
   - Check that the site loads: `https://your-project.vercel.app`
   - Verify data is displaying correctly
   - Check that no Dune API calls are made during initial load

4. **Verify Cron Job**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - Verify cron job is scheduled: `0 */6 * * *` (every 6 hours)
   - First sync will happen automatically at the next scheduled time

## 🔄 Post-Deployment Sync

The sync will run automatically every 6 hours via Vercel Cron Jobs. To manually trigger a sync:

```bash
curl -X POST https://your-project.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

Or wait for the automatic cron job (runs at 00:00, 06:00, 12:00, 18:00 UTC).

## ⚠️ Important Notes

- **NO API CALLS DURING DEPLOYMENT**: The app only reads from the database. No Dune API calls are made during deployment or page loads.
- **Sync Schedule**: Data syncs every 6 hours automatically via Vercel Cron Jobs
- **Database**: All data is stored in Neon PostgreSQL database
- **API Usage**: Only 4 Dune API calls per sync (every 6 hours) = ~16 calls per day

## 📊 Migration Summary

Successfully migrated:
- ✅ token_metrics: 1 record
- ✅ chart_data: 30 records  
- ✅ current_value_by_token: 10 records
- ✅ holders: 12,301 records

## 🔍 Troubleshooting

### If data doesn't load:
1. Check `DATABASE_URL` is set correctly in Vercel
2. Verify Neon database is accessible
3. Check Vercel function logs for errors

### If sync doesn't work:
1. Check Vercel Cron Jobs are enabled
2. Verify `DUNE_API_KEY` is set correctly
3. Check function logs for sync errors
4. Verify `SYNC_SECRET_TOKEN` if using manual sync

### If API calls exceed limit:
- Sync runs every 6 hours automatically
- Each sync makes 3 API calls:
  1. Neet metrics (query 6033699) - single call for all neet metrics
  2. Chart data (if configured)
  3. General GFF Investments (query 6039732)
- Total: ~12 calls per day (well under 2500 limit)

