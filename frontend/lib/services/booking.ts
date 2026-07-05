import { createClient, SupabaseClient } from '@supabase/supabase-js'

export class BookingEngine {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async getLocationSettings(locationId: string) {
    const { data, error } = await this.supabase
      .from('locations')
      .select('min_duration_mins, slot_interval_mins, default_price')
      .eq('id', locationId)
      .single()

    if (error || !data) {
      return { min_duration_mins: 60, slot_interval_mins: 60, default_price: 0 }
    }
    return data
  }

  async upsertCustomer(businessId: string, phone: string, lastLocationId: string | null = null) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('id')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .single()

    if (data) {
      const customerId = data.id
      if (lastLocationId) {
        await this.supabase
          .from('customers')
          .update({ last_location_id: lastLocationId })
          .eq('id', customerId)
      }
      return customerId
    } else {
      const payload: any = { business_id: businessId, phone: phone }
      if (lastLocationId) {
        payload.last_location_id = lastLocationId
      }
      const { data: newData, error: insertError } = await this.supabase
        .from('customers')
        .insert(payload)
        .select('id')
        .single()
      
      if (insertError) throw insertError
      return newData.id
    }
  }

  async getCustomerLastLocation(businessId: string, phone: string) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('last_location_id')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .single()

    if (data) return data.last_location_id
    return null
  }

  async getAvailability(locationId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await this.supabase
      .from('bookings')
      .select('start_time, end_time, status')
      .eq('location_id', locationId)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .in('status', ['confirmed', 'cash_pending', 'pending'])

    if (error) throw error
    return data
  }

  async getAvailableStartTimes(locationId: string, targetDate: Date) {
    const settings = await this.getLocationSettings(locationId)
    const interval = settings.slot_interval_mins || 60

    const bookings = await this.getAvailability(locationId, targetDate)
    const bookedIntervals = bookings.map((b: any) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time)
    }))

    const openTime = new Date(targetDate)
    openTime.setHours(6, 0, 0, 0) // 6 AM
    const closeTime = new Date(targetDate)
    closeTime.setHours(23, 0, 0, 0) // 11 PM

    let currentTime = new Date(openTime)
    const now = new Date()
    
    // If today, push currentTime to next available interval
    if (targetDate.toDateString() === now.toDateString()) {
      if (currentTime < now) {
        currentTime = new Date(now)
      }
      const minsPast = currentTime.getMinutes() % interval
      if (minsPast > 0) {
        currentTime.setMinutes(currentTime.getMinutes() + (interval - minsPast))
      }
      currentTime.setSeconds(0, 0)
    }

    const availableStarts: Date[] = []

    while (currentTime < closeTime) {
      let isFree = true
      for (const b of bookedIntervals) {
        if (b.start <= currentTime && currentTime < b.end) {
          isFree = false
          break
        }
      }

      if (isFree) {
        availableStarts.push(new Date(currentTime))
      }
      currentTime.setMinutes(currentTime.getMinutes() + interval)
    }

    return availableStarts
  }

  async checkDurationAvailable(locationId: string, targetDate: Date, startTime: Date, durationMins: number) {
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + durationMins)
    const bookings = await this.getAvailability(locationId, targetDate)

    for (const b of bookings) {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      if (startTime < bEnd && bStart < endTime) {
        return false
      }
    }
    return true
  }

  async createPendingBooking(locationId: string, customerId: string, startTime: Date, endTime: Date, amount: number) {
    const bookingData = {
      location_id: locationId,
      customer_id: customerId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending',
      amount: amount
    }

    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (e) {
      console.error('Booking failed due to conflict:', e)
      return null
    }
  }

  async confirmBooking(bookingId: string) {
    const { data, error } = await this.supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
