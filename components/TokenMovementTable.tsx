'use client'

import { useEffect, useState } from 'react'
import { TokenTransaction } from '@/types'
import { fetchTokenTransactions } from '@/lib/dune'

export default function TokenMovementTable() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true)
      const data = await fetchTokenTransactions()
      setTransactions(data)
      setLoading(false)
    }
    loadTransactions()
  }, [])

  const formatNumber = (num: number, decimals: number = 8) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    const color = change >= 0 ? 'text-green-500' : 'text-red-500'
    return <span className={color}>{sign}{change.toFixed(2)}%</span>
  }

  if (loading) {
    return (
      <div className="mb-8 bg-dark-surface p-6 rounded-lg border border-dark-border">
        <h2 className="text-xl font-semibold mb-6">Token Movement</h2>
        <div className="text-center py-12 text-gray-500">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="mb-8 bg-dark-surface p-6 rounded-lg border border-dark-border">
      <h2 className="text-xl font-semibold mb-6">Token Movement</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border text-left text-sm text-gray-400">
              <th className="pb-4 pr-4">Type</th>
              <th className="pb-4 pr-4">Amount (PUMP)</th>
              <th className="pb-4 pr-4">Amount (SOL)</th>
              <th className="pb-4 pr-4">Price</th>
              <th className="pb-4 pr-4">Change</th>
              <th className="pb-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr 
                key={index} 
                className="border-b border-dark-border text-sm hover:bg-dark-bg transition-colors"
              >
                <td className="py-4 pr-4">
                  <span className={tx.type === 'Buy' ? 'text-green-500' : 'text-red-500'}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-4 pr-4">{formatNumber(tx.amountPUMP, 2)}</td>
                <td className="py-4 pr-4">{formatNumber(tx.amountSOL, 8)}</td>
                <td className="py-4 pr-4">{formatNumber(tx.price, 8)}</td>
                <td className="py-4 pr-4">{formatChange(tx.change)}</td>
                <td className="py-4">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

