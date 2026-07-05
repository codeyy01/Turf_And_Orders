'use client'

import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { format } from 'date-fns'

type Booking = {
  id: string
  start_time: string
  status: 'pending' | 'confirmed' | 'cash_pending' | 'cancelled'
  amount: number
  customers?: { phone: string; name: string } | null
}

const STATUS_BADGES: Record<Booking['status'], string> = {
  confirmed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
  cash_pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
  pending: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10',
  cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-600/10 line-through',
}

export default function BookingsTable({ initialBookings }: { initialBookings: any[] }) {
  const bookings = useRealtimeBookings<Booking>(initialBookings)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">Date & Time</th>
            <th scope="col" className="px-6 py-4 font-medium">Customer</th>
            <th scope="col" className="px-6 py-4 font-medium">Status</th>
            <th scope="col" className="px-6 py-4 font-medium text-right">Amount</th>
            <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50/50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="font-medium text-gray-900">
                  {format(new Date(booking.start_time), 'MMM d, yyyy')}
                </div>
                <div className="text-gray-500">
                  {format(new Date(booking.start_time), 'h:mm a')}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{booking.customers?.name || 'Unknown'}</div>
                <div className="text-gray-500">{booking.customers?.phone || 'No phone'}</div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    STATUS_BADGES[booking.status]
                  }`}
                >
                  {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">
                ₹{booking.amount || 0}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-emerald-600 hover:text-emerald-900 font-medium text-sm">
                  Manage
                </button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
