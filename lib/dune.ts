import { DuneClient } from '@duneanalytics/client-sdk'

const DUNE_API_KEY = process.env.DUNE_API_KEY || process.env.NEXT_PUBLIC_DUNE_API_KEY || ''
const duneClient = DUNE_API_KEY ? new DuneClient(DUNE_API_KEY) : null

// Helper function to get latest query results using the SDK
async function getLatestQueryResults(queryId: number): Promise<any[]> {
  if (!duneClient) {
    return []
  }
  
  // Skip if query ID is invalid (0 or NaN)
  if (!queryId || isNaN(queryId) || queryId === 0) {
    console.log(`[API CALL] Skipping query ${queryId} - invalid query ID`)
    return []
  }
  
  try {
    console.log(`[API CALL] Executing Dune query ${queryId}...`)
    const result = await duneClient.getLatestResult({ queryId })
    const rows = result.result?.rows || []
    console.log(`[API CALL] Query ${queryId} completed - returned ${rows.length} rows`)
    return rows
  } catch (error) {
    console.error(`[API CALL ERROR] Error fetching Dune query ${queryId}:`, error)
    return []
  }
}

// Query IDs - Replace these with your actual Dune query IDs
const QUERY_IDS = {
  TOKEN_METRICS: process.env.DUNE_QUERY_METRICS || '0', // Replace with your query ID
  CHART_DATA: process.env.DUNE_QUERY_CHART || '0', // Replace with your query ID
  TRANSACTIONS: process.env.DUNE_QUERY_TRANSACTIONS || '0', // Replace with your query ID
  HOLDERS: process.env.DUNE_QUERY_HOLDERS || '6035701', // Holders query ID
  GFF_INVESTMENT: process.env.DUNE_QUERY_GFF_INVESTMENT || '6033699', // GFF Investment query ID
  CURRENT_VALUE_BY_TOKEN: process.env.DUNE_QUERY_CURRENT_VALUE_BY_TOKEN || '6039732', // Current Value By Token Invested query ID
}

// Helper functions to transform Dune data to our format
export async function fetchTokenMetrics(): Promise<{
  totalPUMPPurchasesSOL: number
  totalPUMPPurchasesUSD: number
  totalSupply: number
  totalCirculatingSupplyOffset: number
  tokenSymbol: string
}> {
  // If query ID is not set, return mock data
  if (QUERY_IDS.TOKEN_METRICS === '0' || !DUNE_API_KEY) {
    return {
      totalPUMPPurchasesSOL: 879467,
      totalPUMPPurchasesUSD: 172154143,
      totalSupply: 1000000000000, // 1T
      totalCirculatingSupplyOffset: 10.832,
      tokenSymbol: 'PUMP',
    }
  }

  try {
    const rows = await getLatestQueryResults(parseInt(QUERY_IDS.TOKEN_METRICS))
    if (rows.length > 0) {
      const row = rows[0]
      return {
        totalPUMPPurchasesSOL: row.total_pump_purchases_sol || row.pump_purchases_sol || 0,
        totalPUMPPurchasesUSD: row.total_pump_purchases_usd || row.pump_purchases_usd || 0,
        totalSupply: row.total_supply || 0,
        totalCirculatingSupplyOffset: row.total_circulating_supply_offset || row.circulating_supply_offset || 0,
        tokenSymbol: row.token_symbol || row.symbol || 'PUMP',
      }
    }
  } catch (error) {
    console.error('Error fetching token metrics:', error)
  }

  // Fallback to mock data
  return {
    totalPUMPPurchasesSOL: 879467,
    totalPUMPPurchasesUSD: 172154143,
    totalSupply: 1000000000000, // 1T
    totalCirculatingSupplyOffset: 10.832,
    tokenSymbol: 'PUMP',
  }
}

export async function fetchChartData(): Promise<Array<{
  date: string
  price: number
  marketCap: number
}>> {
  // If query ID is not set, return mock data
  if (QUERY_IDS.CHART_DATA === '0' || !DUNE_API_KEY) {
    const dates = []
    const startDate = new Date('2024-01-24')
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push({
        date: date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        price: Math.random() * 100,
        marketCap: Math.random() * 80,
      })
    }
    return dates
  }

  try {
    const rows = await getLatestQueryResults(parseInt(QUERY_IDS.CHART_DATA))
    return rows.map((row: any) => ({
      date: row.date ? new Date(row.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '',
      price: parseFloat(row.price || row.price_sol || 0),
      marketCap: parseFloat(row.market_cap || row.market_cap_sol || 0),
    }))
  } catch (error) {
    console.error('Error fetching chart data:', error)
    // Return mock data on error
    const dates = []
    const startDate = new Date('2024-01-24')
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push({
        date: date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        price: Math.random() * 100,
        marketCap: Math.random() * 80,
      })
    }
    return dates
  }
}

export async function fetchTokenTransactions(): Promise<Array<{
  type: 'Buy' | 'Sell'
  amountPUMP: number
  amountSOL: number
  price: number
  change: number
  time: string
}>> {
  // If query ID is not set, return mock data
  if (QUERY_IDS.TRANSACTIONS === '0' || !DUNE_API_KEY) {
    const transactions = []
    const types: ('Buy' | 'Sell')[] = ['Buy', 'Sell']
    const startDate = new Date('2024-01-01')
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + Math.floor(i / 10))
      transactions.push({
        type: types[Math.floor(Math.random() * types.length)],
        amountPUMP: Math.random() * 1000000,
        amountSOL: Math.random() * 100,
        price: Math.random() * 0.001,
        change: (Math.random() - 0.5) * 2,
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
    }
    
    return transactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }

  try {
    const rows = await getLatestQueryResults(parseInt(QUERY_IDS.TRANSACTIONS))
    return rows.map((row: any) => ({
      type: ((row.type || row.transaction_type || 'Buy') === 'Buy' ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
      amountPUMP: parseFloat(row.amount_pump || row.amount || 0),
      amountSOL: parseFloat(row.amount_sol || row.sol_amount || 0),
      price: parseFloat(row.price || row.price_sol || 0),
      change: parseFloat(row.change || row.price_change || 0),
      time: row.time ? new Date(row.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    })).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  } catch (error) {
    console.error('Error fetching transactions:', error)
    // Return mock data on error
    const transactions = []
    const types: ('Buy' | 'Sell')[] = ['Buy', 'Sell']
    const startDate = new Date('2024-01-01')
    
    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + Math.floor(i / 10))
      transactions.push({
        type: types[Math.floor(Math.random() * types.length)],
        amountPUMP: Math.random() * 1000000,
        amountSOL: Math.random() * 100,
        price: Math.random() * 0.001,
        change: (Math.random() - 0.5) * 2,
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
    }
    
    return transactions.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }
}

// Fetch holders data from Dune query 6035701
export async function fetchHolders(): Promise<any[]> {
  const HOLDERS_QUERY_ID = parseInt(QUERY_IDS.HOLDERS)
  
  if (!DUNE_API_KEY || HOLDERS_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return [
      { 
        holder: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: 15000000,
        share_percent: 1.5,
        first_acquisition_time: '2024-01-15T10:30:00Z',
        net_flow_24h: 500000,
        net_flow_7d: 2000000
      },
      { 
        holder: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        balance: 8500000,
        share_percent: 0.85,
        first_acquisition_time: '2024-01-20T14:20:00Z',
        net_flow_24h: -200000,
        net_flow_7d: 1500000
      },
      { 
        holder: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        balance: 12000000,
        share_percent: 1.2,
        first_acquisition_time: '2024-01-10T08:15:00Z',
        net_flow_24h: 300000,
        net_flow_7d: -500000
      },
    ]
  }

  try {
    console.log(`[API CALL] Fetching query ${HOLDERS_QUERY_ID} (holders)`)
    const rows = await getLatestQueryResults(HOLDERS_QUERY_ID)
    // Fetch ALL holders - row count doesn't affect API credit cost
    console.log(`[API CALL] Query ${HOLDERS_QUERY_ID} completed - returned ${rows.length} holders`)
    return rows || []
  } catch (error) {
    console.error('Error fetching holders:', error)
    // Return mock data on error
    return [
      { 
        holder: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        balance: 15000000,
        share_percent: 1.5,
        first_acquisition_time: '2024-01-15T10:30:00Z',
        net_flow_24h: 500000,
        net_flow_7d: 2000000
      },
      { 
        holder: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        balance: 8500000,
        share_percent: 0.85,
        first_acquisition_time: '2024-01-20T14:20:00Z',
        net_flow_24h: -200000,
        net_flow_7d: 1500000
      },
      { 
        holder: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        balance: 12000000,
        share_percent: 1.2,
        first_acquisition_time: '2024-01-10T08:15:00Z',
        net_flow_24h: 300000,
        net_flow_7d: -500000
      },
    ]
  }
}

// Fetch all neet metrics from Dune query 6033699 in a single API call
// This optimizes API usage by fetching once instead of 4 separate calls
export async function fetchNeetMetrics(): Promise<{
  gffInvestment: number
  neetCurrentValue: number
  neetUnrealizedPnL: number
  neetUnrealizedPnLPercent: number
}> {
  const GFF_INVESTMENT_QUERY_ID = parseInt(QUERY_IDS.GFF_INVESTMENT)
  
  if (!DUNE_API_KEY || GFF_INVESTMENT_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return {
      gffInvestment: 169539,
      neetCurrentValue: 215272,
      neetUnrealizedPnL: 45733,
      neetUnrealizedPnLPercent: 26.98
    }
  }

  try {
    console.log(`[API CALL] Fetching query ${GFF_INVESTMENT_QUERY_ID} (neet metrics)`)
    const rows = await getLatestQueryResults(GFF_INVESTMENT_QUERY_ID)
    
    if (rows.length > 0) {
      const row = rows[0]
      
      // Extract all values from a single query result
      const gffInvestment = parseFloat(String(
        row.total_usd_invested || 
        row.gff_investment_usd ||
        row.investment_usd ||
        row.total_investment_usd ||
        row.usd_invested ||
        row.investment ||
        0
      )) || 0
      
      const neetCurrentValue = parseFloat(String(
        row.current_value_usd || 
        row.current_value ||
        row.value_usd ||
        row.total_value_usd ||
        row.usd_value ||
        0
      )) || 0
      
      const neetUnrealizedPnL = parseFloat(String(
        row.unrealized_pnl || 
        row.unrealized_pnl_usd ||
        row.pnl ||
        row.unrealized_profit ||
        0
      )) || 0
      
      const neetUnrealizedPnLPercent = parseFloat(String(
        row.unrealized_pnl_perc || 
        row.unrealized_pnl_percent ||
        row.pnl_perc ||
        row.pnl_percent ||
        row.unrealized_profit_perc ||
        0
      )) || 0
      
      console.log(`[API CALL] Query ${GFF_INVESTMENT_QUERY_ID} completed - extracted all 4 metrics`)
      
      return {
        gffInvestment,
        neetCurrentValue,
        neetUnrealizedPnL,
        neetUnrealizedPnLPercent
      }
    }
    
    console.warn('neet metrics query returned no rows')
    return {
      gffInvestment: 0,
      neetCurrentValue: 0,
      neetUnrealizedPnL: 0,
      neetUnrealizedPnLPercent: 0
    }
  } catch (error) {
    console.error('Error fetching neet metrics:', error)
    return {
      gffInvestment: 0,
      neetCurrentValue: 0,
      neetUnrealizedPnL: 0,
      neetUnrealizedPnLPercent: 0
    }
  }
}

// Fetch GFF Investment data from Dune query 6033699
// DEPRECATED: Use fetchNeetMetrics() instead to optimize API calls
export async function fetchGFFInvestment(): Promise<number> {
  const GFF_INVESTMENT_QUERY_ID = parseInt(QUERY_IDS.GFF_INVESTMENT)
  
  if (!DUNE_API_KEY || GFF_INVESTMENT_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return 169539 // Mock value in USD
  }

  try {
    const rows = await getLatestQueryResults(GFF_INVESTMENT_QUERY_ID)
    
    if (rows.length > 0) {
      const row = rows[0]
      
      // Extract USD investment value from the query result
      const gffInvestment = row.total_usd_invested || 
                           row.gff_investment_usd ||
                           row.investment_usd ||
                           row.total_investment_usd ||
                           row.usd_invested ||
                           row.investment ||
                           0
      
      const result = parseFloat(String(gffInvestment)) || 0
      console.log('GFF Investment extracted (USD):', result)
      return result
    }
    console.warn('GFF Investment query returned no rows')
    return 0
  } catch (error) {
    console.error('Error fetching GFF Investment:', error)
    return 0
  }
}

// Fetch neet Current Value from Dune query 6033699 (same query as GFF Investment)
export async function fetchNeetCurrentValue(): Promise<number> {
  const GFF_INVESTMENT_QUERY_ID = parseInt(QUERY_IDS.GFF_INVESTMENT)
  
  if (!DUNE_API_KEY || GFF_INVESTMENT_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return 215272 // Mock value in USD
  }

  try {
    const rows = await getLatestQueryResults(GFF_INVESTMENT_QUERY_ID)
    
    if (rows.length > 0) {
      const row = rows[0]
      
      // Extract current value USD from the query result
      const currentValue = row.current_value_usd || 
                          row.current_value ||
                          row.value_usd ||
                          row.total_value_usd ||
                          row.usd_value ||
                          0
      
      const result = parseFloat(String(currentValue)) || 0
      console.log('neet Current Value extracted (USD):', result)
      return result
    }
    console.warn('neet Current Value query returned no rows')
    return 0
  } catch (error) {
    console.error('Error fetching neet Current Value:', error)
    return 0
  }
}

// Fetch neet Unrealized PnL from Dune query 6033699 (same query)
export async function fetchNeetUnrealizedPnL(): Promise<number> {
  const GFF_INVESTMENT_QUERY_ID = parseInt(QUERY_IDS.GFF_INVESTMENT)
  
  if (!DUNE_API_KEY || GFF_INVESTMENT_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return 45733 // Mock value in USD
  }

  try {
    const rows = await getLatestQueryResults(GFF_INVESTMENT_QUERY_ID)
    
    if (rows.length > 0) {
      const row = rows[0]
      
      // Extract unrealized PnL USD from the query result
      const unrealizedPnL = row.unrealized_pnl || 
                           row.unrealized_pnl_usd ||
                           row.pnl ||
                           row.unrealized_profit ||
                           0
      
      const result = parseFloat(String(unrealizedPnL)) || 0
      console.log('neet Unrealized PnL extracted (USD):', result)
      return result
    }
    console.warn('neet Unrealized PnL query returned no rows')
    return 0
  } catch (error) {
    console.error('Error fetching neet Unrealized PnL:', error)
    return 0
  }
}

// Fetch neet Unrealized PnL % from Dune query 6033699 (same query)
export async function fetchNeetUnrealizedPnLPercent(): Promise<number> {
  const GFF_INVESTMENT_QUERY_ID = parseInt(QUERY_IDS.GFF_INVESTMENT)
  
  if (!DUNE_API_KEY || GFF_INVESTMENT_QUERY_ID === 0) {
    // Return mock data if API key is not set
    return 26.98 // Mock value in percentage
  }

  try {
    const rows = await getLatestQueryResults(GFF_INVESTMENT_QUERY_ID)
    
    if (rows.length > 0) {
      const row = rows[0]
      
      // Extract unrealized PnL percentage from the query result
      const unrealizedPnLPercent = row.unrealized_pnl_perc || 
                                   row.unrealized_pnl_percent ||
                                   row.pnl_perc ||
                                   row.pnl_percent ||
                                   row.unrealized_profit_perc ||
                                   0
      
      const result = parseFloat(String(unrealizedPnLPercent)) || 0
      console.log('neet Unrealized PnL % extracted:', result)
      return result
    }
    console.warn('neet Unrealized PnL % query returned no rows')
    return 0
  } catch (error) {
    console.error('Error fetching neet Unrealized PnL %:', error)
    return 0
  }
}

// Fetch Current Value By Token Invested chart data from Dune query 6039732
export async function fetchCurrentValueByToken(): Promise<Array<{
  token: string
  symbol: string
  totalInvestedUSD: number
  tokenAmountBought: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  firstPurchase: string | null
  lastPurchase: string | null
}>> {
  const QUERY_ID = parseInt(QUERY_IDS.CURRENT_VALUE_BY_TOKEN)
  
  if (!DUNE_API_KEY || QUERY_ID === 0) {
    // Return mock data if API key is not set
    return [
      { 
        token: 'Token A', 
        symbol: 'TOKENA',
        totalInvestedUSD: 40000,
        tokenAmountBought: 1000000,
        currentValue: 50000, 
        unrealizedPnL: 10000,
        unrealizedPnLPercent: 25,
        firstPurchase: '2024-01-01T00:00:00Z',
        lastPurchase: '2024-01-15T00:00:00Z'
      },
    ]
  }

  try {
    console.log(`[API CALL] Fetching query ${QUERY_ID} (current value by token)`)
    const rows = await getLatestQueryResults(QUERY_ID)
    
    return rows.map((row: any) => {
      // Extract token name (symbol)
      const tokenName = row.symbol || 
                       row.token_name || 
                       row.name ||
                       row.token_symbol ||
                       ''
      
      // Extract contract address - this should ALWAYS be the contract address
      const contractAddress = row.token || 
                              row.contract_address ||
                              row.address ||
                              row.contract ||
                              ''
      
      // Token should be the contract address (for URL), symbol should be the name
      const token = contractAddress || tokenName  // Prefer contract address, fallback to name
      const symbol = tokenName || contractAddress  // Prefer name, fallback to contract address
      
      // Extract all fields - matching actual Dune API column names
      const totalInvestedUSD = parseFloat(String(
        row.total_usd_invested ||  // Actual Dune column name
        row.total_invested_usd ||
        row.total_invested ||
        row.invested_usd ||
        row.invested ||
        0
      )) || 0
      
      const tokenAmountBought = parseFloat(String(
        row.total_tokens_bought ||  // Actual Dune column name
        row.token_amount_bought ||
        row.amount_bought ||
        row.token_amount ||
        row.amount ||
        row.quantity ||
        0
      )) || 0
      
      const currentValue = parseFloat(String(
        row.current_value_usd ||  // Actual Dune column name
        row.current_value || 
        row.value ||
        row.value_usd ||
        0
      )) || 0
      
      const unrealizedPnL = parseFloat(String(
        row.unrealized_pnl ||  // Actual Dune column name
        row.unrealized_pnl_usd ||
        row.pnl ||
        row.pnl_usd ||
        (currentValue - totalInvestedUSD) // Calculate if not provided
      )) || (currentValue - totalInvestedUSD)
      
      const unrealizedPnLPercent = parseFloat(String(
        row.unrealized_pnl_perc ||  // Actual Dune column name
        row.unrealized_pnl_percent ||
        row.pnl_perc ||
        row.pnl_percent ||
        (totalInvestedUSD > 0 ? ((currentValue - totalInvestedUSD) / totalInvestedUSD) * 100 : 0) // Calculate if not provided
      )) || (totalInvestedUSD > 0 ? ((currentValue - totalInvestedUSD) / totalInvestedUSD) * 100 : 0)
      
      // Extract dates - Dune returns dates as strings like "2025-08-07 14:26:58.000 UTC"
      let firstPurchase: string | null = null
      if (row.first_purchase || row.first_purchase_date || row.first_buy_date) {
        try {
          // Handle Dune's date format: "2025-08-07 14:26:58.000 UTC"
          const dateStr = row.first_purchase || row.first_purchase_date || row.first_buy_date
          firstPurchase = new Date(dateStr.replace(' UTC', 'Z')).toISOString()
        } catch {
          firstPurchase = null
        }
      }
      
      let lastPurchase: string | null = null
      if (row.last_purchase || row.last_purchase_date || row.last_buy_date) {
        try {
          // Handle Dune's date format: "2025-08-07 14:26:58.000 UTC"
          const dateStr = row.last_purchase || row.last_purchase_date || row.last_buy_date
          lastPurchase = new Date(dateStr.replace(' UTC', 'Z')).toISOString()
        } catch {
          lastPurchase = null
        }
      }
      
      return {
        token: String(token),
        symbol: String(symbol),
        totalInvestedUSD,
        tokenAmountBought,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        firstPurchase,
        lastPurchase
      }
    }).filter((item: any) => item.token && item.currentValue > 0)
  } catch (error) {
    console.error('Error fetching Current Value By Token:', error)
    return []
  }
}

