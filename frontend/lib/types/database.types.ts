// Auto-generate this file once your Supabase schema is finalized:
//   npx supabase gen types typescript --project-id your-project-id > lib/types/database.types.ts
//
// This gives you full autocomplete + type safety on every .from('table') call.
// Placeholder shape for now, matching the bookings table from the product spec:

export type Booking = {
  id: string
  turf_id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cash_pending' | 'cancelled'
  customer_phone: string
  price: number
  created_at: string
}
