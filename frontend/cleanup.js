const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://skqfnalbdffecbwyajem.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcWZuYWxiZGZmZWNid3lhamVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MzIxMjUsImV4cCI6MjA5ODUwODEyNX0.1L1flZCJlTCr2MZe2Pjb_5OtqIc6zSk1-7-ksMCQQ0M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: businesses, error: bError } = await supabase
    .from('businesses')
    .select('*')
    
  console.log('Businesses:', businesses?.length)
  if (bError) console.error(bError)

  if (businesses && businesses.length > 1) {
    console.log('Duplicates found! Deleting all but the first one...')
    const firstId = businesses[0].id
    for (let i = 1; i < businesses.length; i++) {
      const { error } = await supabase.from('businesses').delete().eq('id', businesses[i].id)
      if (error) console.error('Failed to delete', businesses[i].id, error)
      else console.log('Deleted', businesses[i].id)
    }
  }

  const { data: locations, error: lError } = await supabase
    .from('locations')
    .select('*')
  
  console.log('Locations:', locations?.length)
  if (lError) console.error(lError)
  
  if (locations && locations.length > 1) {
    console.log('Duplicate locations found! Deleting all but the first one...')
    const firstId = locations[0].id
    for (let i = 1; i < locations.length; i++) {
      const { error } = await supabase.from('locations').delete().eq('id', locations[i].id)
      if (error) console.error('Failed to delete', locations[i].id, error)
      else console.log('Deleted', locations[i].id)
    }
  }
}

check()
