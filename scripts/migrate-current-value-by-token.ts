import { config } from 'dotenv'
import { resolve } from 'path'
import { Pool } from 'pg'
import { readFileSync } from 'fs'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function runMigration() {
  // For local development, prefer DATABASE_URL over NEON_DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL

  if (!dbUrl) {
    console.error('❌ DATABASE_URL, NEON_DATABASE_URL, or POSTGRES_URL not set')
    process.exit(1)
  }

  console.log('🔄 Running migration for current_value_by_token table...')
  console.log(`Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`)

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    // Test connection
    await pool.query('SELECT 1')
    console.log('✅ Database connected')

    // Read migration SQL
    const migrationSQL = readFileSync(
      resolve(process.cwd(), 'database/migrate-current-value-by-token.sql'),
      'utf-8'
    )

    // Run migration
    console.log('\n📋 Executing migration...')
    await pool.query(migrationSQL)
    console.log('✅ Migration completed successfully!')

    // Verify columns exist
    console.log('\n🔍 Verifying columns...')
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'current_value_by_token'
      ORDER BY ordinal_position
    `)
    
    console.log('\n📊 Current columns in current_value_by_token table:')
    result.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.column_name} (${row.data_type})`)
    })

    console.log('\n✅ Migration verification complete!')
    console.log('\n📝 Next step: Run a sync to populate the new fields:')
    console.log('   curl -X POST https://pumpneetme.vercel.app/api/sync')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    if (error.message?.includes('does not exist')) {
      console.error('\n⚠️  The table may not exist yet. Run the main schema.sql first.')
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()

