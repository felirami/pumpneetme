'use client'

import { useEffect, useState } from 'react'

interface ChartDataPoint {
  token: string
  symbol: string
  currentValue: number
}

export default function Footer() {
  const [neetPortfolioPercent, setNeetPortfolioPercent] = useState<number | null>(null)

  useEffect(() => {
    async function loadChartData() {
      try {
        const response = await fetch('/api/chart')
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          const chartData: ChartDataPoint[] = result.data
          
          // Calculate total current value of all tokens
          const totalCurrentValue = chartData.reduce((sum, token) => sum + (token.currentValue || 0), 0)
          
          // Find neet token
          const neetToken = chartData.find(token => token.symbol?.toLowerCase() === 'neet')
          
          if (neetToken && totalCurrentValue > 0) {
            // Calculate neet's percentage of total portfolio
            const percent = (neetToken.currentValue / totalCurrentValue) * 100
            setNeetPortfolioPercent(percent)
          } else {
            setNeetPortfolioPercent(null)
          }
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
        setNeetPortfolioPercent(null)
      }
    }
    loadChartData()
  }, [])

  return (
    <footer className="mt-8 pb-8">
      <div className="text-xs text-gray-500 text-center space-y-2">
        <p>© 2025 $NEET. No rights reserved.</p>
        <div className="pt-2 border-t border-dark-border">
          {neetPortfolioPercent !== null ? (
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              neet accounts for {neetPortfolioPercent.toFixed(1)}% of GFF
            </p>
          ) : (
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Loading portfolio data...
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}

