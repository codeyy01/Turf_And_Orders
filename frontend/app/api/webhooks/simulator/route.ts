import { NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp'
import { BookingEngine } from '@/lib/services/booking'
import { RazorpayService } from '@/lib/services/razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const supabase = createClient()
    const engine = new BookingEngine(supabase)
    const rzp = new RazorpayService()
    const wa = new WhatsAppService(engine, rzp)
    
    // Enable simulator mode so it doesn't try to call Facebook API
    wa.isSimulator = true
    wa.simulatorResponses = []

    // Process the mock payload
    await wa.processIncomingWebhook(body)

    // Return the intercepted responses back to the UI
    return NextResponse.json({ responses: wa.simulatorResponses })

  } catch (error: any) {
    console.error('Simulator Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
