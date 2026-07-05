import { createClient } from '@/lib/supabase/server'
import BookingsTable from '@/components/bookings/BookingsTable'

export default async function BookingsPage() {
  const supabase = createClient()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, customers(phone, name)')
    .order('start_time', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Bookings</h1>
        <p className="text-sm text-gray-500">
          Manage your complete booking history, manual overrides, and cancellations.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <BookingsTable initialBookings={bookings ?? []} />
      </div>
    </div>
  )
}
