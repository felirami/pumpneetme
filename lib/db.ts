import { Pool } from 'pg'

// Load environment variables if not already loaded (for standalone scripts)
if (!process.env.DATABASE_URL && typeof require !== 'undefined') {
  try {
    const { config } = require('dotenv')
    const { resolve } = require('path')
    config({ path: resolve(process.cwd(), '.env.local') })
  } catch (e) {
    // dotenv not available or already loaded
  }
}

// Determine SSL configuration based on DATABASE_URL or POSTGRES_URL
const getSSLConfig = () => {
  const dbUrl = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL || '').toLowerCase()
  
  // If DATABASE_URL explicitly says no SSL, disable it
  if (dbUrl.includes('?sslmode=disable') || dbUrl.includes('sslmode=disable')) {
    return false
  }
  
  // Local databases typically don't need SSL
  if (dbUrl.includes('localhost') || 
      dbUrl.includes('127.0.0.1') || 
      dbUrl.includes('postgresql://localhost') ||
      dbUrl.includes('postgres://localhost')) {
    return false
  }
  
  // For cloud databases (Supabase, Neon, Vercel Postgres, etc.), use SSL but don't reject unauthorized
  // Only enable SSL if it's a cloud database URL
  if (dbUrl.includes('supabase') || 
      dbUrl.includes('neon') || 
      dbUrl.includes('railway') ||
      dbUrl.includes('render') ||
      dbUrl.includes('vercel') ||
      dbUrl.includes('vercel-storage') ||
      dbUrl.includes('amazonaws.com') ||
      dbUrl.includes('azure.com')) {
    return { rejectUnauthorized: false }
  }
  
  // Default: try without SSL first (most local setups)
  return false
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL,
  ssl: getSSLConfig()
})

export default pool

// Helper function to test connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT current_database(), NOW()')
    console.log('Database connected:', result.rows[0].current_database, 'at', result.rows[0].now)
    return true
  } catch (error: any) {
    console.error('Database connection error:', error.message)
    console.error('Connection string:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    if (error.message?.includes('SSL')) {
      console.error('SSL connection failed. If using local database, add ?sslmode=disable to DATABASE_URL')
    }
    return false
  }
}

