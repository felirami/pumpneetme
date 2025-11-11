'use client'

import { useEffect, useState } from 'react'

interface Investment {
  token: string  // Contract address
  symbol: string  // Token symbol/name
  totalInvestedUSD: number
  tokenAmountBought: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  firstPurchase: string | null
  lastPurchase: string | null
}

export default function Holders() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInvestments() {
      setLoading(true)
      try {
        // Fetch from /api/chart which already returns current_value_by_token data
        const response = await fetch('/api/chart')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          setInvestments(result.data)
        } else {
          console.warn('Invalid data format received:', result)
          setInvestments([])
        }
      } catch (error) {
        console.error('Error loading investments:', error)
        setInvestments([])
      } finally {
        setLoading(false)
      }
    }
    loadInvestments()
  }, [])

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatCurrencyWithTooltip = (num: number) => {
    const formatted = formatCurrency(num)
    const exact = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
    return (
      <span 
        className="cursor-help" 
        title={exact}
      >
        {formatted}
      </span>
    )
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(2)
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    if (address.length > 10) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return address
  }

  const formatLargeNumberWithTooltip = (num: number) => {
    const formatted = formatLargeNumber(num)
    const exact = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
    return (
      <span 
        className="cursor-help" 
        title={exact}
      >
        {formatted}
      </span>
    )
  }

  const formatCurrencyWithColor = (num: number) => {
    const isPositive = num >= 0
    const color = isPositive ? 'text-green-500' : 'text-red-500'
    const sign = isPositive ? '+' : ''
    const formatted = formatCurrency(num)
    const exact = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
    return (
      <span 
        className={`${color} cursor-help`} 
        title={exact}
      >
        {sign}{formatted}
      </span>
    )
  }

  const formatPercentageWithColor = (num: number) => {
    // Dune returns percentage as decimal (0.2698 = 26.98%), so multiply by 100 for display
    const percentage = num * 100
    const isPositive = percentage >= 0
    const color = isPositive ? 'text-green-500' : 'text-red-500'
    const sign = isPositive ? '+' : ''
    const formatted = `${Math.abs(percentage).toFixed(2)}%`
    const exact = `${sign}${percentage.toFixed(6)}%`
    return (
      <span 
        className={`${color} cursor-help`} 
        title={exact}
      >
        {sign}{formatted}
      </span>
    )
  }

  const formatDateWithTooltip = (date: string | null) => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const exact = d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
      return (
        <span 
          className="cursor-help" 
          title={exact}
        >
          {formatted}
        </span>
      )
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="mb-8 bg-dark-surface p-6 rounded-lg border border-dark-border">
        <h2 className="text-xl font-semibold mb-6">General GFF Investments</h2>
        <div className="text-center py-12 text-gray-500">Loading investments data...</div>
      </div>
    )
  }

  return (
    <div className="mb-8 bg-dark-surface p-6 rounded-lg border border-dark-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">General GFF Investments</h2>
        {investments.length > 0 && (
          <div className="text-sm text-gray-400">
            {investments.length} {investments.length === 1 ? 'token' : 'tokens'}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading investments data...</div>
      ) : investments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No investments data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border text-left text-sm text-gray-400">
                <th className="pb-4 pr-4">Token</th>
                <th className="pb-4 pr-4">Symbol</th>
                <th className="pb-4 pr-4">Total Invested USD</th>
                <th className="pb-4 pr-4">Token Amount Bought</th>
                <th className="pb-4 pr-4">Current Value</th>
                <th className="pb-4 pr-4">Unrealized PnL</th>
                <th className="pb-4 pr-4">Unrealized PnL %</th>
                <th className="pb-4 pr-4">First Purchase</th>
                <th className="pb-4">Last Purchase</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment, index) => {
                return (
                  <tr
                    key={`${investment.token}-${index}`}
                    className="border-b border-dark-border text-sm hover:bg-dark-bg transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <a
                        href={`https://pump.fun/coin/${investment.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        title={investment.token}
                      >
                        {formatAddress(investment.token)}
                      </a>
                    </td>
                    <td className="py-4 pr-4 text-gray-300">
                      <span
                        className="cursor-help"
                        title={investment.token}
                      >
                        {investment.symbol || investment.token}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {formatCurrencyWithTooltip(investment.totalInvestedUSD)}
                    </td>
                    <td className="py-4 pr-4">
                      {formatLargeNumberWithTooltip(investment.tokenAmountBought)}
                    </td>
                    <td className="py-4 pr-4">
                      {formatCurrencyWithTooltip(investment.currentValue)}
                    </td>
                    <td className="py-4 pr-4">
                      {formatCurrencyWithColor(investment.unrealizedPnL)}
                    </td>
                    <td className="py-4 pr-4">
                      {formatPercentageWithColor(investment.unrealizedPnLPercent)}
                    </td>
                    <td className="py-4 pr-4 text-gray-400">
                      {formatDateWithTooltip(investment.firstPurchase)}
                    </td>
                    <td className="py-4 text-gray-400">
                      {formatDateWithTooltip(investment.lastPurchase)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

