import cron from 'node-cron'
import { syncAllData } from './sync'
import { testConnection } from './db'

// Run sync every 6 hours to minimize API usage
// Cron format: minute hour day month day-of-week
// This runs at: 00:00, 06:00, 12:00, 18:00
const SYNC_SCHEDULE = '0 */6 * * *' // Every 6 hours

export function startSyncScheduler() {
  // Test database connection first
  testConnection().then(connected => {
    if (!connected) {
      console.error('[SCHEDULER] Database connection failed. Sync scheduler not started.')
      return
    }
    
    console.log('='.repeat(60))
    console.log('[SCHEDULER] Starting sync scheduler...')
    console.log(`[SCHEDULER] Schedule: ${SYNC_SCHEDULE} (every 6 hours)`)
    console.log(`[SCHEDULER] Sync times: 00:00, 06:00, 12:00, 18:00 UTC`)
    console.log('='.repeat(60))
    
    // Run immediately on startup (optional - comment out to skip initial sync)
    // console.log('[SCHEDULER] Running initial sync on startup...')
    // syncAllData().catch(console.error)
    
    // Schedule syncs every 6 hours
    cron.schedule(SYNC_SCHEDULE, () => {
      const now = new Date()
      console.log(`[SCHEDULER] Triggering scheduled sync at ${now.toISOString()}...`)
      syncAllData().catch(error => {
        console.error('[SCHEDULER ERROR] Scheduled sync failed:', error)
      })
    })
    
    console.log('[SCHEDULER] ✅ Sync scheduler started successfully')
    console.log('='.repeat(60))
  })
}

