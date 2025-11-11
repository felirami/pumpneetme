import MetricsHeader from '@/components/MetricsHeader'
import RevenueChart from '@/components/RevenueChart'
import Holders from '@/components/Holders'
import Footer from '@/components/Footer'

export const revalidate = 60 // Revalidate every 60 seconds

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <MetricsHeader />
        <RevenueChart />
        <Holders />
        <Footer />
      </div>
    </main>
  )
}

