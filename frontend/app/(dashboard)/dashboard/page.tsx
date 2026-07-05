import { createClient } from '@/lib/supabase/server'
import SlotCalendar from '@/components/calendar/SlotCalendar'
import StatCard from '@/components/dashboard/StatCard'
import { IndianRupee, CalendarCheck, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Get current user's business
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

  // Get all bookings from today onwards for the calendar
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  // Fetch all future bookings for this user's locations
  let bookingsQuery = supabase
    .from('bookings')
    .select('*')
    .gte('start_time', todayStart.toISOString())
    .order('start_time')
    
  if (locationIds.length > 0) {
    bookingsQuery = bookingsQuery.in('location_id', locationIds)
  }
  const { data: bookings } = await bookingsQuery

  // Calculate Today's Metrics
  const todayBookings = (bookings || []).filter(b => 
    new Date(b.start_time) >= todayStart && 
    new Date(b.start_time) < tomorrowStart
  )

  const todayRevenue = todayBookings
    .filter(b => b.status === 'confirmed' || b.status === 'cash_pending')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0)
    
  const pendingCount = todayBookings.filter(b => b.status === 'pending').length
  const totalBookingsCount = todayBookings.length

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Greeting Section */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">{greeting},</h2>
          <p className="text-gray-500 mt-1 text-lg">Here&apos;s what&apos;s happening at your turf today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl border-2 border-emerald-50">
           {user?.email?.charAt(0).toUpperCase() || 'O'}
        </div>
      </section>

      {/* KPI Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Today's Revenue"
            value={`₹${todayRevenue}`}
            icon={<IndianRupee className="w-6 h-6 text-white" />}
            gradient="from-emerald-500 to-teal-600"
            trend="Confirmed & cash pending"
          />
          <StatCard
            title="Today's Bookings"
            value={totalBookingsCount.toString()}
            icon={<CalendarCheck className="w-6 h-6 text-white" />}
            gradient="from-blue-500 to-indigo-600"
            trend="Total slots booked for today"
          />
          <StatCard
            title="Pending Requests"
            value={pendingCount.toString()}
            icon={<Clock className="w-6 h-6 text-white" />}
            gradient="from-orange-400 to-amber-600"
            trend="Awaiting payment confirmation"
          />
        </div>
      </section>

      {/* Operations Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Today&apos;s Schedule</h3>
        <SlotCalendar initialBookings={bookings ?? []} locationIds={locationIds} />
      </section>

    </div>
  )
}
