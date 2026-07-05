import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BookingEngine } from '@/lib/services/booking'
import { RazorpayService } from '@/lib/services/razorpay'
import { WhatsAppService } from '@/lib/services/whatsapp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
const supabase = createClient(supabaseUrl, supabaseKey)

const bookingEngine = new BookingEngine(supabase)
const razorpayService = new RazorpayService()
const whatsappService = new WhatsAppService(bookingEngine, razorpayService)

// Webhook verification endpoint required by Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const challenge = searchParams.get('hub.challenge')
  const verifyToken = searchParams.get('hub.verify_token')
  
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my_secure_token'

  if (mode === 'subscribe' && verifyToken === expectedToken) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// Receives incoming messages from Meta WhatsApp API
export async function POST(request: Request) {
  try {
    const data = await request.json()
    await whatsappService.processIncomingWebhook(data)
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
