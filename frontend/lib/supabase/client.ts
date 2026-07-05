import { createBrowserClient } from '@supabase/ssr'

// Use this inside 'use client' components — real-time subscriptions,
// form submissions, anything running in the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
