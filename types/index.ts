export interface TokenMetrics {
  totalPUMPPurchasesSOL: number
  totalPUMPPurchasesUSD: number
  totalSupply: number
  totalCirculatingSupplyOffset: number
  tokenSymbol: string
  gffInvestmentUSD: number
  neetCurrentValueUSD: number
  neetUnrealizedPnLUSD: number
  neetUnrealizedPnLPercent: number
}

export interface ChartDataPoint {
  date: string
  price: number
  marketCap: number
}

export interface TokenTransaction {
  type: 'Buy' | 'Sell'
  amountPUMP: number
  amountSOL: number
  price: number
  change: number
  time: string
}

export interface Holder {
  holder?: string
  balance?: number | string
  perc_share?: number | string
  first_acquisition_time?: string
  flow_24h?: number | string
  flow_7d?: number | string
  [key: string]: any // Allow for flexible column names from Dune
}

