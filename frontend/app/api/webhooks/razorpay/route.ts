import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
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

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    const headersList = headers()
    const signature = headersList.get('x-razorpay-signature') || ''

    if (!razorpayService.verifyWebhookSignature(bodyText, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const data = JSON.parse(bodyText)
    const event = data.event
    
    if (event === 'payment.captured') {
      const paymentEntity = data.payload?.payment?.entity || {}
      const bookingId = paymentEntity.notes?.booking_id
      
      if (bookingId) {
        const booking = await bookingEngine.confirmBooking(bookingId)
        if (booking) {
          const customerId = booking.customer_id
          const { data: custData } = await supabase
            .from('customers')
            .select('phone')
            .eq('id', customerId)
            .single()
            
          if (custData) {
            await whatsappService.sendBookingConfirmation(custData.phone, booking)
          }
        }
        console.log(`Booking ${bookingId} confirmed successfully.`)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error in Razorpay webhook:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
