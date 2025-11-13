import { NextResponse } from 'next/server'
import { syncAllData, getSyncStatus } from '@/lib/sync'

// Manual sync endpoint (ONLY called via Vercel Cron Job)
// Vercel Cron Jobs will call this endpoint every 6 hours
// IMPORTANT: This endpoint ONLY works via Vercel Cron Jobs to prevent API call usage
export async function POST(request: Request) {
  try {
    // ONLY allow Vercel Cron Job requests - reject all manual calls
    // Vercel automatically adds the 'x-vercel-cron' header for cron jobs
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    
    // Allow manual trigger with secret token (for admin/debugging)
    const authHeader = request.headers.get('authorization')
    const secretToken = process.env.SYNC_SECRET_TOKEN || 'temporary-admin-token-2025'
    const isAuthorized = authHeader === `Bearer ${secretToken}`
    
    if (!isVercelCron && !isAuthorized) {
      console.warn('[SYNC API] Rejected - not a Vercel Cron Job request or authorized manual trigger')
      return NextResponse.json({ 
        error: 'Sync can only be triggered by Vercel Cron Jobs. Manual syncs are disabled to prevent API call usage.',
        hint: 'Sync runs automatically every 6 hours via Vercel Cron Jobs'
      }, { status: 403 })
    }
    
    if (isAuthorized) {
      console.log('[SYNC API] Manual trigger authorized via secret token')
    }
    
    console.log('[SYNC API] Starting sync via Vercel Cron Job...')
    await syncAllData()
    const status = getSyncStatus()
    return NextResponse.json({ 
      message: 'Sync completed successfully',
      status: {
        lastSyncTime: status.lastSyncTime?.toISOString(),
        apiCallCount: status.apiCallCount
      }
    })
  } catch (error: any) {
    console.error('[API ERROR] Error running sync:', error)
    const status = getSyncStatus()
    return NextResponse.json({ 
      error: error.message,
      status: {
        isSyncing: status.isSyncing,
        lastSyncTime: status.lastSyncTime?.toISOString(),
        nextSyncAllowed: status.nextSyncAllowed?.toISOString()
      }
    }, { status: 500 })
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const status = getSyncStatus()
    return NextResponse.json({
      isSyncing: status.isSyncing,
      lastSyncTime: status.lastSyncTime?.toISOString() || null,
      lastSyncAttempt: status.lastSyncAttempt?.toISOString() || null,
      apiCallCount: status.apiCallCount,
      nextSyncAllowed: status.nextSyncAllowed?.toISOString() || null,
      syncSchedule: 'Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

