'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Subscribes to the bookings table so the calendar updates the instant
// a customer pays on WhatsApp — no polling, no refresh button.
export function useRealtimeBookings<T extends { id: string; location_id?: string }>(initial: T[], locationIds: string[] = []) {
  const [bookings, setBookings] = useState<T[]>(initial)
  const locationIdsKey = locationIds.sort().join(',')

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          setBookings((current) => {
            const newRecord = payload.new as T
            const oldRecord = payload.old as T
            
            if (payload.eventType === 'INSERT') {
               if (locationIds.length > 0 && !locationIds.includes(newRecord.location_id!)) return current
               return [...current, newRecord]
            }
            if (payload.eventType === 'UPDATE') {
               return current.map((b) => (b.id === newRecord.id ? newRecord : b))
            }
            if (payload.eventType === 'DELETE') {
               return current.filter((b) => b.id !== oldRecord.id)
            }
            return current
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationIdsKey])

  return bookings
}
