import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { syncAllData } from '../lib/sync'
import { testConnection } from '../lib/db'

async function main() {
  console.log('Starting manual sync...')
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables.')
    console.error('Please add DATABASE_URL to your .env.local file')
    console.error('Example: DATABASE_URL=postgresql://user:password@localhost:5432/database')
    process.exit(1)
  }
  
  const connected = await testConnection()
  if (!connected) {
    console.error('❌ Database connection failed.')
    console.error('Please check:')
    console.error('1. DATABASE_URL is correct in .env.local')
    console.error('2. Database server is running')
    console.error('3. Database exists and tables are created (run database/schema.sql)')
    console.error('4. For local PostgreSQL, ensure SSL is disabled or add ?sslmode=disable to DATABASE_URL')
    process.exit(1)
  }
  
  try {
    await syncAllData()
    console.log('✅ Sync completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

main()

