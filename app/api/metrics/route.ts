import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        total_pump_purchases_sol as "totalPUMPPurchasesSOL",
        total_pump_purchases_usd as "totalPUMPPurchasesUSD",
        total_supply as "totalSupply",
        total_circulating_supply_offset as "totalCirculatingSupplyOffset",
        token_symbol as "tokenSymbol",
        gff_investment_usd as "gff_investment_usd",
        neet_current_value_usd as "neet_current_value_usd",
        neet_unrealized_pnl_usd as "neet_unrealized_pnl_usd",
        neet_unrealized_pnl_perc as "neet_unrealized_pnl_perc"
      FROM token_metrics
      ORDER BY updated_at DESC
      LIMIT 1
    `)
    
    if (result.rows.length === 0) {
      console.warn('No metrics found in database. Run sync to populate data.')
      return NextResponse.json({ error: 'No metrics found. Please run sync.' }, { status: 404 })
    }
    
    // Convert NUMERIC fields from strings to numbers
    const metrics = {
      totalPUMPPurchasesSOL: parseFloat(String(result.rows[0].totalPUMPPurchasesSOL || 0)),
      totalPUMPPurchasesUSD: parseFloat(String(result.rows[0].totalPUMPPurchasesUSD || 0)),
      totalSupply: parseFloat(String(result.rows[0].totalSupply || 0)),
      totalCirculatingSupplyOffset: parseFloat(String(result.rows[0].totalCirculatingSupplyOffset || 0)),
      tokenSymbol: String(result.rows[0].tokenSymbol || 'PUMP'),
      gffInvestmentUSD: parseFloat(String(result.rows[0].gff_investment_usd || 0)),
      neetCurrentValueUSD: parseFloat(String(result.rows[0].neet_current_value_usd || 0)),
      neetUnrealizedPnLUSD: parseFloat(String(result.rows[0].neet_unrealized_pnl_usd || 0)),
      neetUnrealizedPnLPercent: parseFloat(String(result.rows[0].neet_unrealized_pnl_perc || 0))
    }
    
    return NextResponse.json({ data: metrics })
  } catch (error: any) {
    console.error('Error fetching metrics:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
      console.warn('Token metrics table may not exist yet. Run database migration and sync.')
      return NextResponse.json({ error: 'Database table does not exist. Please run migration.' }, { status: 500 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
