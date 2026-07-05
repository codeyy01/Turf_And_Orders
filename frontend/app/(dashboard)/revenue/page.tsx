import { createClient } from '@/lib/supabase/server'
import RevenueChart from '@/components/revenue/RevenueChart'

export default async function RevenuePage() {
  const supabase = createClient()

  // Fetch all confirmed/cash_pending bookings for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, amount, status')
    .gte('start_time', sevenDaysAgo.toISOString())
    .in('status', ['confirmed', 'cash_pending'])

  // Calculate total for summary cards
  const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Revenue Dashboard</h1>
        <p className="text-sm text-gray-500">
          Monitor your earnings over the last 7 days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">7-Day Total</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">₹{totalRevenue}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Bookings</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{bookings?.length || 0}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Revenue</h2>
        <RevenueChart bookings={bookings ?? []} />
      </div>
    </div>
  )
}
