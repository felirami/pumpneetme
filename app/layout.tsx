import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pump.fun Token Analytics',
  description: 'Real-time token analytics and transaction data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Note: Sync scheduler is handled by Vercel Cron Jobs (see vercel.json)
  // The node-cron scheduler doesn't work in Vercel's serverless environment
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

