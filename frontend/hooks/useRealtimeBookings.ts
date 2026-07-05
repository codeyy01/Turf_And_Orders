'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Subscribes to the bookings table so the calendar updates the instant
// a customer pays on WhatsApp — no polling, no refresh button.
export function useRealtimeBookings<T extends { id: string }>(initial: T[]) {
  const [bookings, setBookings] = useState<T[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          setBookings((current) => {
            if (payload.eventType === 'INSERT') return [...current, payload.new as T]
            if (payload.eventType === 'UPDATE')
              return current.map((b) => (b.id === payload.new.id ? (payload.new as T) : b))
            if (payload.eventType === 'DELETE')
              return current.filter((b) => b.id !== (payload.old as T).id)
            return current
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return bookings
}
