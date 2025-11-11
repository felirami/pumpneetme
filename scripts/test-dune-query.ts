import { config } from 'dotenv'
import { resolve } from 'path'
import { DuneClient } from '@duneanalytics/client-sdk'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testDuneQuery() {
  const DUNE_API_KEY = process.env.DUNE_API_KEY
  const QUERY_ID = 6039732

  if (!DUNE_API_KEY) {
    console.error('❌ DUNE_API_KEY not set')
    process.exit(1)
  }

  console.log(`🔍 Testing Dune query ${QUERY_ID}...`)
  console.log(`API Key: ${DUNE_API_KEY.substring(0, 10)}...`)

  try {
    const duneClient = new DuneClient(DUNE_API_KEY)
    const result = await duneClient.getLatestResult({ queryId: QUERY_ID })
    
    console.log('\n📊 Raw Dune API Response:')
    console.log('Result structure:', JSON.stringify(Object.keys(result), null, 2))
    
    if (result.result) {
      console.log('\nResult keys:', Object.keys(result.result))
      console.log('Rows count:', result.result.rows?.length || 0)
      
      if (result.result.rows && result.result.rows.length > 0) {
        console.log('\n📋 First row sample:')
        console.log(JSON.stringify(result.result.rows[0], null, 2))
        
        console.log('\n📋 All column names from first row:')
        if (result.result?.rows?.[0]) {
          const firstRow = result.result.rows[0]
          Object.keys(firstRow).forEach((key, idx) => {
            console.log(`  ${idx + 1}. ${key}: ${firstRow[key]} (${typeof firstRow[key]})`)
          })
        }
        
        console.log('\n📋 All rows:')
        result.result.rows.forEach((row: any, idx: number) => {
          console.log(`\nRow ${idx + 1}:`)
          Object.keys(row).forEach(key => {
            console.log(`  ${key}: ${row[key]}`)
          })
        })
      } else {
        console.log('\n⚠️  No rows returned from Dune query')
      }
    } else {
      console.log('\n⚠️  No result object in response')
      console.log('Full response:', JSON.stringify(result, null, 2))
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

testDuneQuery()

