import { createClient } from '@/lib/supabase/server'
import BookingsTable from '@/components/bookings/BookingsTable'

export default async function BookingsPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user?.id)
    .limit(1)
    .single()
    
  let locationIds: string[] = []
  if (business) {
     const { data: locs } = await supabase.from('locations').select('id').eq('business_id', business.id)
     locationIds = locs?.map(l => l.id) || []
  }

  let query = supabase
    .from('bookings')
    .select('*, customers(phone, name)')
    .order('start_time', { ascending: false })
    .limit(100)
    
  if (locationIds.length > 0) {
    query = query.in('location_id', locationIds)
  }
  const { data: bookings } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Bookings</h1>
        <p className="text-sm text-gray-500">
          Manage your complete booking history, manual overrides, and cancellations.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <BookingsTable initialBookings={bookings ?? []} locationIds={locationIds} />
      </div>
    </div>
  )
}
