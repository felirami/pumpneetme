import pool from './db'
import { fetchTokenMetrics, fetchChartData, fetchNeetMetrics, fetchCurrentValueByToken } from './dune'

// Track API calls for logging
let apiCallCount = 0
let lastSyncTime: Date | null = null

// Sync token metrics
export async function syncTokenMetrics() {
  try {
    console.log('[SYNC] Starting token metrics sync...')
    
    const metrics = await fetchTokenMetrics()
    // Only count API call if query ID was actually used (not mock data)
    if (process.env.DUNE_QUERY_METRICS && process.env.DUNE_QUERY_METRICS !== '0') {
      apiCallCount++
    }
    
    // Fetch all neet metrics in a single API call (optimized)
    console.log('[SYNC] Fetching neet metrics (optimized - single API call)...')
    const neetMetrics = await fetchNeetMetrics()
    apiCallCount++ // Only 1 API call instead of 4!
    
    await pool.query(`
      INSERT INTO token_metrics (
        total_pump_purchases_sol,
        total_pump_purchases_usd,
        total_supply,
        total_circulating_supply_offset,
        token_symbol,
        gff_investment_usd,
        neet_current_value_usd,
        neet_unrealized_pnl_usd,
        neet_unrealized_pnl_perc,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (token_symbol) 
      DO UPDATE SET
        total_pump_purchases_sol = EXCLUDED.total_pump_purchases_sol,
        total_pump_purchases_usd = EXCLUDED.total_pump_purchases_usd,
        total_supply = EXCLUDED.total_supply,
        total_circulating_supply_offset = EXCLUDED.total_circulating_supply_offset,
        gff_investment_usd = EXCLUDED.gff_investment_usd,
        neet_current_value_usd = EXCLUDED.neet_current_value_usd,
        neet_unrealized_pnl_usd = EXCLUDED.neet_unrealized_pnl_usd,
        neet_unrealized_pnl_perc = EXCLUDED.neet_unrealized_pnl_perc,
        updated_at = NOW()
    `, [
      metrics.totalPUMPPurchasesSOL,
      metrics.totalPUMPPurchasesUSD,
      metrics.totalSupply,
      metrics.totalCirculatingSupplyOffset,
      metrics.tokenSymbol,
      neetMetrics.gffInvestment,
      neetMetrics.neetCurrentValue,
      neetMetrics.neetUnrealizedPnL,
      neetMetrics.neetUnrealizedPnLPercent
    ])
    
    console.log('[SYNC] Token metrics synced successfully')
  } catch (error) {
    console.error('[SYNC ERROR] Error syncing token metrics:', error)
    throw error
  }
}

// Sync chart data
export async function syncChartData() {
  try {
    console.log('[SYNC] Starting chart data sync...')
    const chartData = await fetchChartData()
    // Only count API call if query ID was actually used (not skipped)
    if (chartData.length > 0 && process.env.DUNE_QUERY_CHART && process.env.DUNE_QUERY_CHART !== '0') {
      apiCallCount++
    }
    
    // Clear old data (optional - you might want to keep historical data)
    // await pool.query('DELETE FROM chart_data')
    
    for (const data of chartData) {
      const date = new Date(data.date)
      
      await pool.query(`
        INSERT INTO chart_data (date, price, market_cap, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (date) 
        DO UPDATE SET
          price = EXCLUDED.price,
          market_cap = EXCLUDED.market_cap,
          created_at = NOW()
      `, [date, data.price, data.marketCap])
    }
    
    console.log(`[SYNC] Chart data synced successfully: ${chartData.length} records`)
  } catch (error) {
    console.error('[SYNC ERROR] Error syncing chart data:', error)
    throw error
  }
}

// Sync current value by token chart data (General GFF Investments)
// This replaces the old Holders sync - uses query 6039732
export async function syncCurrentValueByToken() {
  try {
    console.log('[SYNC] Starting current value by token sync...')
    const chartData = await fetchCurrentValueByToken()
    apiCallCount++ // Current value by token query
    
    // Clear existing data
    await pool.query('DELETE FROM current_value_by_token')
    
    for (const data of chartData) {
      await pool.query(`
        INSERT INTO current_value_by_token (
          token, symbol, total_invested_usd, token_amount_bought,
          current_value, unrealized_pnl, unrealized_pnl_perc,
          first_purchase, last_purchase, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (token) 
        DO UPDATE SET
          symbol = EXCLUDED.symbol,
          total_invested_usd = EXCLUDED.total_invested_usd,
          token_amount_bought = EXCLUDED.token_amount_bought,
          current_value = EXCLUDED.current_value,
          unrealized_pnl = EXCLUDED.unrealized_pnl,
          unrealized_pnl_perc = EXCLUDED.unrealized_pnl_perc,
          first_purchase = EXCLUDED.first_purchase,
          last_purchase = EXCLUDED.last_purchase,
          updated_at = NOW()
      `, [
        data.token,
        data.symbol,
        data.totalInvestedUSD,
        data.tokenAmountBought,
        data.currentValue,
        data.unrealizedPnL,
        data.unrealizedPnLPercent,
        data.firstPurchase ? new Date(data.firstPurchase) : null,
        data.lastPurchase ? new Date(data.lastPurchase) : null
      ])
    }
    
    console.log(`[SYNC] Current Value By Token synced successfully: ${chartData.length} records`)
  } catch (error) {
    console.error('[SYNC ERROR] Error syncing current value by token:', error)
    throw error
  }
}

// Rate limiting: prevent multiple syncs within 5 minutes
let isSyncing = false
let lastSyncAttempt: Date | null = null
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// Sync all data with rate limiting and logging
export async function syncAllData() {
  const now = new Date()
  
  // Rate limiting check
  if (isSyncing) {
    console.warn('[SYNC] Sync already in progress, skipping...')
    throw new Error('Sync already in progress')
  }
  
  if (lastSyncAttempt && (now.getTime() - lastSyncAttempt.getTime()) < MIN_SYNC_INTERVAL_MS) {
    const minutesSinceLastSync = Math.floor((now.getTime() - lastSyncAttempt.getTime()) / 60000)
    console.warn(`[SYNC] Rate limit: Last sync was ${minutesSinceLastSync} minutes ago. Minimum interval is 5 minutes.`)
    throw new Error(`Rate limit: Please wait ${5 - minutesSinceLastSync} more minutes before syncing again`)
  }
  
  isSyncing = true
  lastSyncAttempt = now
  apiCallCount = 0
  
  console.log('='.repeat(60))
  console.log(`[SYNC] Starting data sync from Dune API at ${now.toISOString()}`)
  console.log('='.repeat(60))
  
  try {
    await syncTokenMetrics()
    await syncChartData()
    // Removed syncHolders() - no longer using Holders query (6035701)
    // General GFF Investments uses syncCurrentValueByToken() with query 6039732
    await syncCurrentValueByToken()
    
    lastSyncTime = new Date()
    
    console.log('='.repeat(60))
    console.log(`[SYNC] ✅ All data synced successfully!`)
    console.log(`[SYNC] Total API calls made: ${apiCallCount}`)
    console.log(`[SYNC] Next sync scheduled in 6 hours`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('='.repeat(60))
    console.error('[SYNC ERROR] Error syncing all data:', error)
    console.error(`[SYNC] API calls made before error: ${apiCallCount}`)
    console.error('='.repeat(60))
    throw error
  } finally {
    isSyncing = false
  }
}

// Export sync status for monitoring
export function getSyncStatus() {
  return {
    isSyncing,
    lastSyncTime,
    lastSyncAttempt,
    apiCallCount,
    nextSyncAllowed: lastSyncAttempt 
      ? new Date(lastSyncAttempt.getTime() + MIN_SYNC_INTERVAL_MS)
      : null
  }
}

