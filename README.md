# Pump.neet.me

A modern web application for displaying cryptocurrency token analytics, integrated with Dune.com API and PostgreSQL database caching.

## Features

- Real-time token metrics ($neet Total Invested, Current Value, Unrealized PnL)
- Current Value By Token Invested chart
- Holders table with pagination
- Dark theme UI matching pump.fun design
- Dune.com API integration with PostgreSQL caching
- Automated data sync every 6 hours

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
   - Install PostgreSQL locally or use a cloud provider (Supabase, Neon, Railway, etc.)
   - Create a database
   - Run the schema: `psql -d your_database < database/schema.sql`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Dune API
DUNE_API_KEY=your_dune_api_key_here
DUNE_QUERY_METRICS=your_metrics_query_id
DUNE_QUERY_CHART=your_chart_query_id
DUNE_QUERY_TRANSACTIONS=your_transactions_query_id
DUNE_QUERY_HOLDERS=6035701
DUNE_QUERY_GFF_INVESTMENT=6033699
DUNE_QUERY_CURRENT_VALUE_BY_TOKEN=6039732

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Optional: Sync authentication
SYNC_SECRET_TOKEN=your_secret_token_here
```

4. Get your Dune API key:
   - Sign up at [dune.com](https://dune.com)
   - Go to your profile settings
   - Generate an API key

5. Run initial database sync:
```bash
npm run sync
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Use a cloud provider like:
   - [Supabase](https://supabase.com) (recommended)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)
   - [Render](https://render.com)

### Deployment Steps

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   In Vercel project settings, add all environment variables from `.env.local`:
   - `DUNE_API_KEY`
   - `DUNE_QUERY_METRICS`
   - `DUNE_QUERY_CHART`
   - `DUNE_QUERY_TRANSACTIONS`
   - `DUNE_QUERY_HOLDERS` (6035701)
   - `DUNE_QUERY_GFF_INVESTMENT` (6033699)
   - `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` (6039732)
   - `DATABASE_URL` (your PostgreSQL connection string)
   - `CRON_SECRET` (optional, for cron job security - generate a random string)
   - `SYNC_SECRET_TOKEN` (optional, for manual sync)

4. **Set up Database**:
   - Run the schema SQL on your PostgreSQL database:
   ```bash
   psql $DATABASE_URL < database/schema.sql
   ```
   Or use your database provider's SQL editor.

5. **Deploy**:
   - Vercel will automatically deploy on push
   - Or click "Deploy" in the Vercel dashboard

6. **Run Initial Sync**:
   After deployment, trigger the first sync:
   ```bash
   curl -X POST https://your-app.vercel.app/api/sync \
     -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
   ```
   Or manually call the endpoint from Vercel's function logs.

### Vercel Cron Jobs

The app uses Vercel Cron Jobs to sync data every 6 hours automatically. The cron job is configured in `vercel.json`:

- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Endpoint**: `/api/sync`
- **Function Timeout**: 300 seconds (5 minutes)

The cron job will automatically run at:
- 00:00 UTC
- 06:00 UTC
- 12:00 UTC
- 18:00 UTC

### Manual Sync

You can manually trigger a sync by calling:
```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_SECRET_TOKEN"
```

Or check sync status:
```bash
curl https://your-app.vercel.app/api/sync
```

## Database Schema

The application uses PostgreSQL with the following tables:
- `token_metrics` - Stores token metrics and neet investment data
- `chart_data` - Stores historical price and market cap data
- `current_value_by_token` - Stores current value by token invested chart data
- `holders` - Stores token holder information

See `database/schema.sql` for the complete schema.

## API Routes

- `/api/metrics` - Get token metrics
- `/api/chart` - Get chart data
- `/api/holders` - Get holders data (with pagination)
- `/api/sync` - Trigger manual sync or check sync status

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── metrics/      # Token metrics endpoint
│   │   ├── chart/        # Chart data endpoint
│   │   ├── holders/      # Holders data endpoint
│   │   └── sync/         # Sync endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── MetricsHeader.tsx # Header with metrics
│   ├── RevenueChart.tsx  # Chart component
│   ├── Holders.tsx       # Holders table
│   └── Footer.tsx        # Footer component
├── lib/
│   ├── db.ts            # Database connection
│   ├── dune.ts          # Dune API integration
│   ├── sync.ts          # Data sync logic
│   └── scheduler.ts     # Scheduler (local only, not used in Vercel)
├── database/
│   └── schema.sql       # Database schema
└── scripts/
    └── sync.ts          # Manual sync script
```

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- PostgreSQL
- Dune Analytics API
- Vercel (deployment platform)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DUNE_API_KEY` | Dune Analytics API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DUNE_QUERY_HOLDERS` | Holders query ID (default: 6035701) | Yes |
| `DUNE_QUERY_GFF_INVESTMENT` | GFF Investment query ID (default: 6033699) | Yes |
| `DUNE_QUERY_CURRENT_VALUE_BY_TOKEN` | Chart query ID (default: 6039732) | Yes |
| `CRON_SECRET` | Secret for Vercel Cron Jobs | Optional |
| `SYNC_SECRET_TOKEN` | Secret for manual sync | Optional |

## License

© 2025 $NEET. No rights reserved.
