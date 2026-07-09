'use client'

import { useState, useMemo, useRef } from 'react'
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Calendar, DollarSign, Activity, CheckSquare, Square } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

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
  pending: 'bg-purple-100 text-purple-700 ring-1 ring-purple-600/20',
  cancelled: 'bg-rose-100 text-rose-600 ring-1 ring-rose-600/20 line-through',
}

export default function BookingsTable({ initialBookings, locationIds = [] }: { initialBookings: any[], locationIds?: string[] }) {
  const bookings = useRealtimeBookings<Booking>(initialBookings, locationIds)
  const supabase = createClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Sorting state
  const [sortField, setSortField] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const isSelectionMode = selectedIds.size > 0
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

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

  const handleInteractionStart = (id: string) => {
    if (isSelectionMode) return
    longPressTimer.current = setTimeout(() => {
      toggleSelect(id)
      // Provide haptic feedback if available on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 500)
  }

  const handleInteractionEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleItemClick = (id: string) => {
    if (isSelectionMode) {
      toggleSelect(id)
    }
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

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      let comparison = 0
      if (sortField === 'date') {
        comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      } else if (sortField === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0)
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [bookings, sortField, sortOrder])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const isAllSelected = bookings.length > 0 && selectedIds.size === bookings.length

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="flex flex-col space-y-6 relative">
      
      {/* Sticky Selection Bar (Glassmorphism) */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-indigo-100 shadow-sm px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4 max-w-7xl mx-auto w-full">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 text-indigo-700 font-semibold text-sm hover:text-indigo-900 transition-colors"
              >
                {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                <span className="hidden sm:inline">Select All</span>
              </button>
              <span className="text-xs font-bold text-indigo-900/70 bg-indigo-100 px-3 py-1 rounded-full">
                {selectedIds.size} selected
              </span>
              
              <div className="flex-1" />
              
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-indigo-100 shadow-sm">
        {/* Sort Controls */}
        <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 overflow-x-auto">
          <button 
            onClick={() => toggleSort('date')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${sortField === 'date' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
          <button 
            onClick={() => toggleSort('amount')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${sortField === 'amount' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
          <button 
            onClick={() => toggleSort('status')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${sortField === 'status' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-purple-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-xl">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 text-xs uppercase text-indigo-900/70 font-semibold border-b border-indigo-100">
            <tr>
              {isSelectionMode && (
                <th scope="col" className="px-6 py-5 w-12 transition-all duration-300">
                  <input 
                    type="checkbox" 
                    className="rounded-md border-indigo-200 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer w-4 h-4"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th scope="col" className="px-6 py-5">Date & Time</th>
              <th scope="col" className="px-6 py-5">Customer</th>
              <th scope="col" className="px-6 py-5">Status</th>
              <th scope="col" className="px-6 py-5 text-right">Amount</th>
              <th scope="col" className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-indigo-50"
          >
            <AnimatePresence>
              {sortedBookings.map((booking) => (
                <motion.tr 
                  variants={itemVariants}
                  layout
                  key={booking.id} 
                  onMouseDown={() => handleInteractionStart(booking.id)}
                  onMouseUp={handleInteractionEnd}
                  onMouseLeave={handleInteractionEnd}
                  onTouchStart={() => handleInteractionStart(booking.id)}
                  onTouchEnd={handleInteractionEnd}
                  onClick={() => handleItemClick(booking.id)}
                  className={`group transition-colors ${selectedIds.has(booking.id) ? 'bg-indigo-50/60' : 'hover:bg-indigo-50/30'} ${isSelectionMode ? 'cursor-pointer' : ''}`}
                >
                  {isSelectionMode && (
                    <td className="px-6 py-4 whitespace-nowrap w-12 transition-all duration-300">
                      <input 
                        type="checkbox" 
                        className="rounded-md border-indigo-200 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer w-4 h-4 pointer-events-none"
                        checked={selectedIds.has(booking.id)}
                        readOnly
                      />
                    </td>
                  )}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">
                      {format(new Date(booking.start_time), 'MMM d, yyyy')}
                    </div>
                    <div className="text-gray-500 font-medium">
                      {format(new Date(booking.start_time), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{booking.customers?.name || 'Unknown'}</div>
                    <div className="text-gray-500">{booking.customers?.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                        STATUS_BADGES[booking.status]
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
                    ₹{booking.amount || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'confirmed') }} 
                           className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
                         >
                           Confirm
                         </button>
                      )}
                      {booking.status !== 'cancelled' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'cancelled') }} 
                           className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
                         >
                           Cancel
                         </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={isSelectionMode ? 6 : 5} className="px-6 py-12 text-center text-gray-500 bg-white">
                  No bookings found.
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col space-y-4 pb-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col space-y-4"
        >
          <AnimatePresence>
            {sortedBookings.map((booking) => (
              <motion.div 
                variants={itemVariants}
                layout
                key={booking.id} 
                onMouseDown={() => handleInteractionStart(booking.id)}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={() => handleInteractionStart(booking.id)}
                onTouchEnd={handleInteractionEnd}
                onClick={() => handleItemClick(booking.id)}
                className={`relative overflow-hidden bg-white rounded-2xl p-5 shadow-lg flex flex-col space-y-4 transition-all duration-300 ${selectedIds.has(booking.id) ? 'border-2 border-indigo-500 shadow-indigo-500/20 scale-[1.02]' : 'border border-indigo-50 hover:shadow-xl hover:border-indigo-100'} ${isSelectionMode ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Decorative background gradient */}
                <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${
                  booking.status === 'confirmed' ? 'bg-emerald-500' :
                  booking.status === 'cancelled' ? 'bg-rose-500' :
                  booking.status === 'pending' ? 'bg-purple-500' :
                  'bg-amber-500'
                }`} />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox (Only visible in selection mode) */}
                    {isSelectionMode && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                      >
                        <input 
                          type="checkbox" 
                          className="rounded-md border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 mt-1 cursor-pointer transition-transform hover:scale-110 pointer-events-none"
                          checked={selectedIds.has(booking.id)}
                          readOnly
                        />
                      </motion.div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{booking.customers?.name || 'Unknown'}</div>
                      <div className="text-sm font-medium text-gray-500">{booking.customers?.phone || 'No phone'}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm ${STATUS_BADGES[booking.status]}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-50 relative z-10">
                  <div>
                    <div className="text-indigo-900/50 text-xs font-bold uppercase tracking-wider mb-1">Date & Time</div>
                    <div className="font-bold text-gray-900">{format(new Date(booking.start_time), 'MMM d, yyyy')}</div>
                    <div className="text-gray-600 font-medium">{format(new Date(booking.start_time), 'h:mm a')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-900/50 text-xs font-bold uppercase tracking-wider mb-1">Amount</div>
                    <div className="font-black text-gray-900 text-2xl tracking-tight">₹{booking.amount || 0}</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-indigo-50 relative z-10">
                  {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'confirmed') }} 
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'cancelled') }} 
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {bookings.length === 0 && (
            <div className="p-10 text-center text-gray-500 bg-white/50 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm">
              <Calendar className="w-12 h-12 mx-auto text-indigo-200 mb-4" />
              <p className="font-medium text-lg text-indigo-900">No bookings found</p>
              <p className="text-sm">When customers book slots, they will appear here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
