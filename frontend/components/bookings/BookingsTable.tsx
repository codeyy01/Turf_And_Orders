'use client'

import { useState } from 'react'
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

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
  const supabase = createClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id)
    } catch (e) {
      console.error(e)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === bookings.length && bookings.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(bookings.map(b => b.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} bookings? This action cannot be undone.`)) return
    
    setIsDeleting(true)
    try {
      const idsToDelete = Array.from(selectedIds)
      await supabase.from('bookings').delete().in('id', idsToDelete)
      setSelectedIds(new Set())
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const isAllSelected = bookings.length > 0 && selectedIds.size === bookings.length

  return (
    <div className="flex flex-col space-y-3">
      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-sm font-medium text-red-800">
            {selectedIds.size} booking{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Selected'}</span>
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-4 font-medium">Date & Time</th>
              <th scope="col" className="px-6 py-4 font-medium">Customer</th>
              <th scope="col" className="px-6 py-4 font-medium">Status</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Amount</th>
              <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(booking.id) ? 'bg-emerald-50/30' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={selectedIds.has(booking.id)}
                    onChange={() => toggleSelect(booking.id)}
                  />
                </td>
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
                  <div className="flex justify-end space-x-4">
                    {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                       <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="text-emerald-600 hover:text-emerald-900 font-medium text-sm">
                         Confirm
                       </button>
                    )}
                    {booking.status !== 'cancelled' && (
                       <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="text-red-500 hover:text-red-700 font-medium text-sm">
                         Cancel
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 bg-white">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
