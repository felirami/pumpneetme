import { NextResponse } from 'next/server'
import { DuneClient } from '@duneanalytics/client-sdk'

// This endpoint is deprecated - all data now comes from the database
// Kept for backwards compatibility or manual testing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryId = searchParams.get('queryId')
  
  if (!queryId) {
    return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
  }

  const DUNE_API_KEY = process.env.DUNE_API_KEY
  if (!DUNE_API_KEY) {
    return NextResponse.json({ error: 'Dune API key not configured' }, { status: 500 })
  }

  try {
    const duneClient = new DuneClient(DUNE_API_KEY)
    const result = await duneClient.getLatestResult({ queryId: parseInt(queryId) })
    return NextResponse.json({ data: result.result?.rows || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

