'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ChartDataPoint {
  token: string
  symbol: string
  currentValue: number
  invested: number
}

export default function RevenueChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    async function loadChartData() {
      try {
        const response = await fetch('/api/chart')
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          setChartData(result.data)
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
      }
    }
    loadChartData()
  }, [])

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Generate gradient colors for bars (green shades)
  const getBarColor = (index: number, total: number) => {
    const baseHue = 142 // Green
    const saturation = 70
    const lightness = 45 + (index % 3) * 5 // Vary lightness slightly
    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2 text-sm">{payload[0].payload.symbol || payload[0].payload.token}</p>
          <p className="text-green-500 text-sm">
            Current Value: <span className="font-semibold ml-1">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  return (
    <div className="mb-8 bg-dark-surface p-6 rounded-lg border border-dark-border">
      <h2 className="text-xl font-semibold mb-6 text-white">Current Value By Token Invested</h2>

      {chartData.length > 0 ? (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barCategoryGap="20%"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#1a1a1a" 
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="symbol"
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                stroke="#666"
                tick={{ fill: '#999', fontSize: 12 }}
                label={{ 
                  value: 'USD', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#999',
                  style: { fontSize: 12 }
                }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="currentValue"
                name="Current Value"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(index, chartData.length)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="animate-pulse text-gray-400">Loading chart data...</div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-dark-border space-y-3 text-xs text-gray-400 leading-relaxed">
        <p>
          This chart highlights how poorly Pump.fun's investment strategy has performed overall. Nearly all tokens in the portfolio have lost over 80% of their initial value, with most sitting deep in the red.
        </p>
        <p>
          The only notable exception is $NEET, which has significantly appreciated and now represents the majority of the portfolio's remaining value. This suggests that while a few isolated picks succeeded, the broader allocation was highly inefficient, resulting in massive unrealized losses across nearly every other token.
        </p>
      </div>
    </div>
  )
}
