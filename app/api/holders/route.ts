import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '100', 10)
    const offset = (page - 1) * pageSize
    
    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 500) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }
    
    // Fetch from database only - NO API fallbacks to minimize API usage
    const result = await pool.query(`
      SELECT 
        holder_address as holder,
        balance,
        perc_share as "perc_share",
        first_acquisition_time as "first_acquisition_time",
        flow_24h as "flow_24h",
        flow_7d as "flow_7d"
      FROM holders
      ORDER BY balance DESC
      LIMIT $1 OFFSET $2
    `, [pageSize, offset])
    
    // Get total count for pagination
    const countResult = await pool.query('SELECT COUNT(*) as total FROM holders')
    const total = parseInt(countResult.rows[0].total, 10)
    const totalPages = Math.ceil(total / pageSize)
    
    console.log(`[API] Fetched ${result.rows.length} holders from database (page ${page}/${totalPages})`)
    
    const holders = result.rows.map(row => ({
      holder: row.holder,
      balance: parseFloat(String(row.balance || 0)),
      perc_share: parseFloat(String(row.perc_share || 0)),
      first_acquisition_time: row.first_acquisition_time ? new Date(row.first_acquisition_time).toISOString() : null,
      flow_24h: parseFloat(String(row.flow_24h || 0)),
      flow_7d: parseFloat(String(row.flow_7d || 0))
    }))
    
    return NextResponse.json({ 
      data: holders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
    
  } catch (error: any) {
    console.error('[API ERROR] Error fetching holders:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    
    // Return error instead of falling back to Dune API
    if (error.message?.includes('does not exist') || 
        error.message?.includes('relation') || 
        error.code === '42P01') {
      return NextResponse.json({ 
        error: 'Database table does not exist. Please run sync to populate data.',
        data: [],
        pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: error.message,
      data: [],
      pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
    }, { status: 500 })
  }
}
