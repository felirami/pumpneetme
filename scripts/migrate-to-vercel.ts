import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { Pool } from 'pg'

// Migration script to copy data from source database to Vercel Postgres
async function migrateDatabase() {
  const sourceDbUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL
  const targetDbUrl = process.env.NEON_DATABASE_URL || process.env.VERCEL_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!sourceDbUrl) {
    console.error('❌ SOURCE_DATABASE_URL or DATABASE_URL not set')
    console.error('Set SOURCE_DATABASE_URL to your current database connection string')
    process.exit(1)
  }

  if (!targetDbUrl) {
    console.error('❌ NEON_DATABASE_URL, VERCEL_POSTGRES_URL, or POSTGRES_URL not set')
    console.error('Set NEON_DATABASE_URL to your Neon database connection string')
    process.exit(1)
  }

  if (sourceDbUrl === targetDbUrl) {
    console.error('❌ Source and target databases are the same!')
    console.error('Set SOURCE_DATABASE_URL to your current database')
    console.error('Set NEON_DATABASE_URL to your Neon database')
    process.exit(1)
  }

  console.log('🔄 Starting database migration...')
  console.log(`Source: ${sourceDbUrl.replace(/:[^:@]+@/, ':****@')}`)
  console.log(`Target: ${targetDbUrl.replace(/:[^:@]+@/, ':****@')}`)

  const sourcePool = new Pool({
    connectionString: sourceDbUrl,
    ssl: sourceDbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  const targetPool = new Pool({
    connectionString: targetDbUrl,
    ssl: targetDbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    // Test connections
    console.log('\n📡 Testing database connections...')
    await sourcePool.query('SELECT 1')
    console.log('✅ Source database connected')
    await targetPool.query('SELECT 1')
    console.log('✅ Target database connected')

    // Ensure schema exists in target
    console.log('\n📋 Creating schema in target database...')
    const schema = `
      -- Table for token metrics
      CREATE TABLE IF NOT EXISTS token_metrics (
        id SERIAL PRIMARY KEY,
        total_pump_purchases_sol NUMERIC,
        total_pump_purchases_usd NUMERIC,
        total_supply NUMERIC,
        total_circulating_supply_offset NUMERIC,
        token_symbol VARCHAR(10),
        gff_investment_usd NUMERIC,
        neet_current_value_usd NUMERIC,
        neet_unrealized_pnl_usd NUMERIC,
        neet_unrealized_pnl_perc NUMERIC,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(token_symbol)
      );

      -- Table for chart data
      CREATE TABLE IF NOT EXISTS chart_data (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        price NUMERIC,
        market_cap NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date)
      );

      -- Table for current value by token invested chart data
      CREATE TABLE IF NOT EXISTS current_value_by_token (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) NOT NULL,
        symbol VARCHAR(50),
        total_invested_usd NUMERIC,
        token_amount_bought NUMERIC,
        current_value NUMERIC,
        unrealized_pnl NUMERIC,
        unrealized_pnl_perc NUMERIC,
        first_purchase TIMESTAMP,
        last_purchase TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(token)
      );

      -- Table for holders data
      CREATE TABLE IF NOT EXISTS holders (
        id SERIAL PRIMARY KEY,
        holder_address VARCHAR(255) NOT NULL,
        balance NUMERIC,
        perc_share NUMERIC,
        first_acquisition_time TIMESTAMP,
        flow_24h NUMERIC,
        flow_7d NUMERIC,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(holder_address)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_holders_balance ON holders(balance DESC);
      CREATE INDEX IF NOT EXISTS idx_chart_data_date ON chart_data(date ASC);
      CREATE INDEX IF NOT EXISTS idx_holders_updated ON holders(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_current_value_by_token_updated ON current_value_by_token(updated_at DESC);
    `
    await targetPool.query(schema)
    console.log('✅ Schema created')

    // Migrate token_metrics
    console.log('\n📊 Migrating token_metrics...')
    const tokenMetrics = await sourcePool.query('SELECT * FROM token_metrics')
    if (tokenMetrics.rows.length > 0) {
      for (const row of tokenMetrics.rows) {
        await targetPool.query(`
          INSERT INTO token_metrics (
            total_pump_purchases_sol, total_pump_purchases_usd, total_supply,
            total_circulating_supply_offset, token_symbol, gff_investment_usd,
            neet_current_value_usd, neet_unrealized_pnl_usd, neet_unrealized_pnl_perc, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (token_symbol) DO UPDATE SET
            total_pump_purchases_sol = EXCLUDED.total_pump_purchases_sol,
            total_pump_purchases_usd = EXCLUDED.total_pump_purchases_usd,
            total_supply = EXCLUDED.total_supply,
            total_circulating_supply_offset = EXCLUDED.total_circulating_supply_offset,
            gff_investment_usd = EXCLUDED.gff_investment_usd,
            neet_current_value_usd = EXCLUDED.neet_current_value_usd,
            neet_unrealized_pnl_usd = EXCLUDED.neet_unrealized_pnl_usd,
            neet_unrealized_pnl_perc = EXCLUDED.neet_unrealized_pnl_perc,
            updated_at = EXCLUDED.updated_at
        `, [
          row.total_pump_purchases_sol, row.total_pump_purchases_usd, row.total_supply,
          row.total_circulating_supply_offset, row.token_symbol, row.gff_investment_usd,
          row.neet_current_value_usd, row.neet_unrealized_pnl_usd, row.neet_unrealized_pnl_perc,
          row.updated_at
        ])
      }
      console.log(`✅ Migrated ${tokenMetrics.rows.length} token_metrics records`)
    } else {
      console.log('⚠️  No token_metrics data to migrate')
    }

    // Migrate chart_data
    console.log('\n📈 Migrating chart_data...')
    const chartData = await sourcePool.query('SELECT * FROM chart_data ORDER BY date')
    if (chartData.rows.length > 0) {
      for (const row of chartData.rows) {
        await targetPool.query(`
          INSERT INTO chart_data (date, price, market_cap, created_at)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (date) DO UPDATE SET
            price = EXCLUDED.price,
            market_cap = EXCLUDED.market_cap,
            created_at = EXCLUDED.created_at
        `, [row.date, row.price, row.market_cap, row.created_at])
      }
      console.log(`✅ Migrated ${chartData.rows.length} chart_data records`)
    } else {
      console.log('⚠️  No chart_data to migrate')
    }

    // Migrate current_value_by_token
    console.log('\n💰 Migrating current_value_by_token...')
    const currentValueByToken = await sourcePool.query('SELECT * FROM current_value_by_token')
    if (currentValueByToken.rows.length > 0) {
      for (const row of currentValueByToken.rows) {
        await targetPool.query(`
          INSERT INTO current_value_by_token (
            token, symbol, total_invested_usd, token_amount_bought,
            current_value, unrealized_pnl, unrealized_pnl_perc,
            first_purchase, last_purchase, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (token) DO UPDATE SET
            symbol = EXCLUDED.symbol,
            total_invested_usd = EXCLUDED.total_invested_usd,
            token_amount_bought = EXCLUDED.token_amount_bought,
            current_value = EXCLUDED.current_value,
            unrealized_pnl = EXCLUDED.unrealized_pnl,
            unrealized_pnl_perc = EXCLUDED.unrealized_pnl_perc,
            first_purchase = EXCLUDED.first_purchase,
            last_purchase = EXCLUDED.last_purchase,
            updated_at = EXCLUDED.updated_at
        `, [
          row.token,
          row.symbol || null,
          row.total_invested_usd || row.invested || null,
          row.token_amount_bought || null,
          row.current_value || null,
          row.unrealized_pnl || null,
          row.unrealized_pnl_perc || null,
          row.first_purchase || null,
          row.last_purchase || null,
          row.updated_at
        ])
      }
      console.log(`✅ Migrated ${currentValueByToken.rows.length} current_value_by_token records`)
    } else {
      console.log('⚠️  No current_value_by_token data to migrate')
    }

    // Migrate holders (using batch insert for better performance)
    console.log('\n👥 Migrating holders...')
    const holders = await sourcePool.query('SELECT * FROM holders ORDER BY balance DESC')
    if (holders.rows.length > 0) {
      console.log(`  Found ${holders.rows.length} holders to migrate...`)
      
      // Use batch insert for better performance (100 records at a time)
      const batchSize = 100
      let migrated = 0
      
      for (let i = 0; i < holders.rows.length; i += batchSize) {
        const batch = holders.rows.slice(i, i + batchSize)
        const values: any[] = []
        const placeholders: string[] = []
        
        batch.forEach((row, idx) => {
          const offset = idx * 7
          placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`)
          values.push(
            row.holder_address,
            row.balance,
            row.perc_share,
            row.first_acquisition_time,
            row.flow_24h,
            row.flow_7d,
            row.updated_at
          )
        })
        
        await targetPool.query(`
          INSERT INTO holders (
            holder_address, balance, perc_share, first_acquisition_time,
            flow_24h, flow_7d, updated_at
          ) VALUES ${placeholders.join(', ')}
          ON CONFLICT (holder_address) DO UPDATE SET
            balance = EXCLUDED.balance,
            perc_share = EXCLUDED.perc_share,
            first_acquisition_time = EXCLUDED.first_acquisition_time,
            flow_24h = EXCLUDED.flow_24h,
            flow_7d = EXCLUDED.flow_7d,
            updated_at = EXCLUDED.updated_at
        `, values)
        
        migrated += batch.length
        if (migrated % 500 === 0 || migrated === holders.rows.length) {
          console.log(`  Progress: ${migrated}/${holders.rows.length} holders migrated...`)
        }
      }
      
      console.log(`✅ Migrated ${holders.rows.length} holders records`)
    } else {
      console.log('⚠️  No holders data to migrate')
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...')
    const targetMetrics = await targetPool.query('SELECT COUNT(*) FROM token_metrics')
    const targetChart = await targetPool.query('SELECT COUNT(*) FROM chart_data')
    const targetCurrentValue = await targetPool.query('SELECT COUNT(*) FROM current_value_by_token')
    const targetHolders = await targetPool.query('SELECT COUNT(*) FROM holders')

    console.log('\n📊 Migration Summary:')
    console.log(`  token_metrics: ${targetMetrics.rows[0].count} records`)
    console.log(`  chart_data: ${targetChart.rows[0].count} records`)
    console.log(`  current_value_by_token: ${targetCurrentValue.rows[0].count} records`)
    console.log(`  holders: ${targetHolders.rows[0].count} records`)

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Update DATABASE_URL in Vercel to use NEON_DATABASE_URL')
    console.log('2. Redeploy your application')
    console.log('3. Verify data is loading correctly')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await sourcePool.end()
    await targetPool.end()
  }
}

migrateDatabase()

