'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TokenMetrics } from '@/types'

export default function MetricsHeader() {
  const [metrics, setMetrics] = useState<TokenMetrics | null>(null)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch('/api/metrics')
        const result = await response.json()
        if (result.data) {
          setMetrics(result.data)
        }
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
    }
    loadMetrics()
  }, [])

  if (!metrics) {
    return (
      <div className="mb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {/* Larger background circle */}
            <div className="w-24 h-24 bg-dark-surface rounded-full flex items-center justify-center border border-dark-border mx-auto">
              {/* Inner circle with logo */}
              <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center border border-dark-border overflow-hidden relative">
                <Image 
                  src="/images/neet-logo.webp" 
                  alt="NEET Logo" 
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">pump.neet.me</h1>
          <p className="text-sm text-gray-400 text-center">
            <a 
              href="https://fees.pump.fun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Glass Full Foundation (GFF): we bought a token and never worked again
            </a>
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Loading portfolio data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Total Invested</div>
            <div className="text-2xl font-semibold text-green-500">Loading...</div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Current Value</div>
            <div className="text-2xl font-semibold">Loading...</div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Unrealized PnL</div>
            <div className="text-2xl font-semibold">Loading...</div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Unrealized PnL %</div>
            <div className="text-2xl font-semibold">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(n)) return '0'
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(n)
  }

  const formatCurrency = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(n)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n)
  }

  const formatSupply = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(n)) return '0'
    if (n >= 1000000000000) {
      return `${(n / 1000000000000).toFixed(0)}T`
    }
    return formatNumber(n)
  }

  const formatPercentage = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(n)) return '0.000%'
    return `${Number(n).toFixed(3)}%`
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              {/* Larger background circle */}
              <div className="w-24 h-24 bg-dark-surface rounded-full flex items-center justify-center border border-dark-border mx-auto">
                {/* Inner circle with logo */}
                <div className="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center border border-dark-border overflow-hidden relative">
                  <Image 
                    src="/images/neet-logo.webp" 
                    alt="NEET Logo" 
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">pump.neet.me</h1>
            <p className="text-sm text-gray-400 text-center">
              <a 
                href="https://fees.pump.fun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                Glass Full Foundation (GFF): we bought a token and never worked again
              </a>
            </p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Total Invested</div>
            <div className="text-2xl font-semibold text-white">
              {formatCurrency(metrics.gffInvestmentUSD)}
            </div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Current Value</div>
            <div className="text-2xl font-semibold text-white">{formatCurrency(metrics.neetCurrentValueUSD)}</div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Unrealized PnL</div>
            <div className="text-2xl font-semibold text-green-500">{formatCurrency(metrics.neetUnrealizedPnLUSD)}</div>
          </div>
          <div className="bg-dark-surface p-6 rounded-lg border border-dark-border">
            <div className="text-gray-400 text-sm mb-2">$neet Unrealized PnL %</div>
            <div className="text-2xl font-semibold text-green-500">{formatPercentage(metrics.neetUnrealizedPnLPercent)}</div>
          </div>
        </div>
    </div>
  )
}

