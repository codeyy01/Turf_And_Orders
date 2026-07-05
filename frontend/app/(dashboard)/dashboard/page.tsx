import { createClient } from '@/lib/supabase/server'
import SlotCalendar from '@/components/calendar/SlotCalendar'
import RevenueCard from '@/components/dashboard/RevenueCard'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Need to fetch user info for the greeting
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .gte('start_time', new Date().toISOString())
    .order('start_time')

  // Derive a simple greeting based on time of day
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
        <RevenueCard />
      </section>

      {/* Operations Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Today&apos;s Schedule</h3>
        <SlotCalendar initialBookings={bookings ?? []} />
      </section>

    </div>
  )
}
