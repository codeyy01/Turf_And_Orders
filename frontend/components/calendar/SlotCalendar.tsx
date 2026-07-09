'use client'

import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { Clock, CheckCircle2, AlertCircle, Ban } from 'lucide-react'

type Booking = {
  id: string
  start_time: string
  status: 'pending' | 'confirmed' | 'cash_pending' | 'cancelled'
}

const STATUS_CONFIG: Record<Booking['status'], { style: string, icon: any, label: string }> = {
  confirmed: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Confirmed' },
  cash_pending: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Cash Pending' },
  pending: { style: 'bg-gray-50 text-gray-500 border-gray-200', icon: Clock, label: 'Pending' },
  cancelled: { style: 'bg-red-50 text-red-400 border-red-100 opacity-60', icon: Ban, label: 'Cancelled' },
}

export default function SlotCalendar({ initialBookings, locationIds = [] }: { initialBookings: Booking[], locationIds?: string[] }) {
  const [bookings] = useRealtimeBookings<Booking>(initialBookings, locationIds)

  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center flex flex-col items-center justify-center space-y-3">
        <Clock className="w-8 h-8 text-gray-400" />
        <p className="text-gray-500 font-medium">No bookings yet for today.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="divide-y divide-gray-100">
        {bookings.map((b) => {
          const config = STATUS_CONFIG[b.status];
          const Icon = config.icon;
          return (
            <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-xl border ${config.style}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg tracking-tight">
                    {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-500">1 hour session</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.style}`}>
                  {config.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
