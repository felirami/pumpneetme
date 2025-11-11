# Database Setup and Sync Configuration

This setup minimizes Dune API usage by caching data in PostgreSQL and syncing hourly.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

You can use:
- **Local PostgreSQL**: Install PostgreSQL locally
- **Supabase**: Free PostgreSQL hosting (recommended for development)
- **Neon**: Serverless PostgreSQL
- **Railway/Render**: Other hosting options

### 3. Create Database Tables

Run the SQL schema file to create the tables:

```bash
# If using local PostgreSQL
psql -U your_user -d your_database -f database/schema.sql

# Or connect to your database and run the SQL manually
```

### 4. Configure Environment Variables

Add to your `.env.local`:

```env
# Dune API (only used for syncing)
DUNE_API_KEY=your_dune_api_key
DUNE_QUERY_METRICS=your_metrics_query_id
DUNE_QUERY_CHART=your_chart_query_id
DUNE_QUERY_HOLDERS=6035701

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:port/database
# Example for Supabase:
# DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Optional: Secret token for manual sync endpoint
SYNC_SECRET_TOKEN=your_secret_token_here
```

### 5. Run Initial Sync

```bash
npm run sync
```

This will fetch data from Dune API and populate your database.

### 6. Start Development Server

```bash
npm run dev
```

The app will now read from the database instead of calling Dune API directly.

## How It Works

1. **Hourly Sync**: The sync scheduler runs every hour to fetch fresh data from Dune API
2. **Database Cache**: All API routes read from PostgreSQL instead of Dune
3. **Manual Sync**: You can trigger a manual sync via POST `/api/sync` (with auth token)

## API Routes

- `GET /api/metrics` - Reads from database
- `GET /api/chart` - Reads from database  
- `GET /api/holders` - Reads from database
- `POST /api/sync` - Manual sync trigger (requires SYNC_SECRET_TOKEN)
- `GET /api/sync` - Check last sync time

## Sync Schedule

- **Automatic**: Every hour (in production)
- **Manual**: Run `npm run sync` or POST to `/api/sync`

## Cost Optimization

- **Before**: Every page load = 3 Dune API calls
- **After**: 3 Dune API calls per hour (regardless of traffic)
- **Savings**: ~99% reduction in API calls for high-traffic sites

## Production Deployment

For production, you can:
1. Use a cron job service (like cron-job.org) to call `/api/sync` hourly
2. Or use the built-in scheduler (runs automatically in production)
3. Or use Vercel Cron Jobs or similar platform features

## Troubleshooting

- **Database connection errors**: Check your DATABASE_URL
- **Sync not running**: Check logs and ensure DUNE_API_KEY is set
- **No data**: Run initial sync with `npm run sync`

