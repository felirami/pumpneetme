import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Fetch Current Value By Token Invested chart data
    // Use DISTINCT ON to ensure we only get one record per symbol
    // Prefer records where token is a contract address (longer, contains 'pump' or is a valid address)
    // Sort by current_value DESC to show highest values first
    const result = await pool.query(`
      SELECT * FROM (
        SELECT DISTINCT ON (symbol)
          token,
          symbol,
          total_invested_usd as "totalInvestedUSD",
          token_amount_bought as "tokenAmountBought",
          current_value as "currentValue",
          unrealized_pnl as "unrealizedPnL",
          unrealized_pnl_perc as "unrealizedPnLPercent",
          first_purchase as "firstPurchase",
          last_purchase as "lastPurchase"
        FROM current_value_by_token
        WHERE symbol IS NOT NULL AND symbol != ''
        ORDER BY symbol, 
          CASE 
            WHEN token LIKE '%pump' OR LENGTH(token) > 20 THEN 1
            ELSE 2
          END
      ) AS unique_tokens
      ORDER BY "currentValue" DESC
    `)
    
    console.log(`Fetched ${result.rows.length} current value by token records from database`)
    
    const chartData = result.rows.map(row => ({
      token: String(row.token || ''),
      symbol: String(row.symbol || row.token || ''),
      totalInvestedUSD: parseFloat(String(row.totalInvestedUSD || 0)),
      tokenAmountBought: parseFloat(String(row.tokenAmountBought || 0)),
      currentValue: parseFloat(String(row.currentValue || 0)),
      unrealizedPnL: parseFloat(String(row.unrealizedPnL || 0)),
      unrealizedPnLPercent: parseFloat(String(row.unrealizedPnLPercent || 0)),
      firstPurchase: row.firstPurchase ? new Date(row.firstPurchase).toISOString() : null,
      lastPurchase: row.lastPurchase ? new Date(row.lastPurchase).toISOString() : null
    }))
    
    return NextResponse.json({ data: chartData })
  } catch (error: any) {
    console.error('Error fetching chart data:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      console.warn('Current value by token table may not exist yet. Run database migration and sync.')
      return NextResponse.json({ data: [] })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
