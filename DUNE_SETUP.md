# Dune.com API Integration Guide

This guide will help you set up the Dune.com API integration for fetching real-time token data.

## Step 1: Get Your Dune API Key

1. Sign up or log in to [Dune.com](https://dune.com)
2. Navigate to your profile settings
3. Go to the "API Keys" section
4. Generate a new API key
5. Copy the API key

## Step 2: Create Dune Queries

You'll need to create three queries in Dune Analytics:

### Query 1: Token Metrics

This query should return the following columns:
- `sol_volume_24h` (or `total_24h_sol_volume`) - Total SOL volume in last 24 hours
- `usd_volume_24h` (or `total_24h_usd_volume`) - Total USD volume in last 24 hours
- `total_supply` - Total token supply
- `token_symbol` (or `symbol`) - Token symbol (e.g., "PUMP")

**Example SQL Query Structure:**
```sql
SELECT 
  SUM(volume_sol) as sol_volume_24h,
  SUM(volume_usd) as usd_volume_24h,
  MAX(total_supply) as total_supply,
  'PUMP' as token_symbol
FROM token_metrics
WHERE timestamp >= NOW() - INTERVAL '24 hours'
```

### Query 2: Chart Data (Price and Market Cap)

This query should return:
- `date` - Date of the data point
- `price` (or `price_sol`) - Token price in SOL
- `market_cap` (or `market_cap_sol`) - Market cap in SOL

**Example SQL Query Structure:**
```sql
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  AVG(price_sol) as price,
  AVG(market_cap_sol) as market_cap
FROM token_price_history
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date ASC
```

### Query 3: Token Transactions

This query should return:
- `type` (or `transaction_type`) - "Buy" or "Sell"
- `amount_pump` (or `amount`) - Amount of tokens
- `amount_sol` (or `sol_amount`) - Amount in SOL
- `price` (or `price_sol`) - Price per token
- `change` (or `price_change`) - Price change percentage
- `time` - Transaction timestamp

**Example SQL Query Structure:**
```sql
SELECT 
  CASE WHEN is_buy THEN 'Buy' ELSE 'Sell' END as type,
  amount as amount_pump,
  sol_amount as amount_sol,
  price_sol as price,
  price_change_pct as change,
  timestamp as time
FROM token_transactions
ORDER BY timestamp DESC
LIMIT 100
```

## Step 3: Get Query IDs

1. After creating each query, open it in Dune
2. Look at the URL - it will contain the query ID (e.g., `https://dune.com/queries/123456`)
3. Copy the query ID number

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory with:

```
DUNE_API_KEY=your_api_key_here
DUNE_QUERY_METRICS=123456
DUNE_QUERY_CHART=123457
DUNE_QUERY_TRANSACTIONS=123458
```

Replace the query IDs with your actual query IDs from Step 3.

## Step 5: Test the Integration

1. Start the development server: `npm run dev`
2. Open `http://localhost:3000`
3. Check the browser console for any API errors
4. Verify that data is loading correctly

## Troubleshooting

### API Key Issues
- Make sure your API key is correct
- Check that the API key has the necessary permissions
- Verify the key is in `.env.local` (not committed to git)

### Query Issues
- Ensure your queries return the expected column names
- Check that queries execute successfully in Dune
- Verify query IDs are correct in `.env.local`

### Data Format Issues
- The code supports multiple column name variations (e.g., `sol_volume_24h` or `total_24h_sol_volume`)
- Check the browser console for data transformation errors
- Ensure date formats are compatible

### Mock Data Fallback
If the API integration fails, the app will automatically fall back to mock data so you can see the UI structure. Check the console logs to see what's happening.

## Dune API Documentation

For more information, visit:
- [Dune API Documentation](https://docs.dune.com/api-reference)
- [Dune Query API](https://docs.dune.com/api-reference/query-api)

