import { BookingEngine } from './booking'
import { RazorpayService } from './razorpay'

// Mock session state for dev (In prod, use Redis or DB for session state)
const sessions: Record<string, any> = {}

export class WhatsAppService {
  private token: string
  private phoneNumberId: string
  private baseUrl: string
  private bookingEngine: BookingEngine
  private razorpay: RazorpayService
  
  public isSimulator: boolean = false
  public simulatorResponses: any[] = []

  constructor(bookingEngine: BookingEngine, razorpay: RazorpayService) {
    this.token = process.env.WHATSAPP_TOKEN || 'your-whatsapp-token'
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID || 'your-phone-id'
    this.baseUrl = `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`
    this.bookingEngine = bookingEngine
    this.razorpay = razorpay
  }

  private async sendRequest(payload: any) {
    if (this.isSimulator) {
      this.simulatorResponses.push(payload)
      return
    }
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        console.error('WhatsApp API Error:', await response.text())
      }
    } catch (e) {
      console.error('Fetch error:', e)
    }
  }

  async sendText(to: string, text: string) {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    }
    await this.sendRequest(payload)
  }

  async sendDateSelection(to: string) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'When would you like to book?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: `date_${today.toISOString().split('T')[0]}`, title: 'Today' } },
            { type: 'reply', reply: { id: `date_${tomorrow.toISOString().split('T')[0]}`, title: 'Tomorrow' } }
          ]
        }
      }
    }
    await this.sendRequest(payload)
  }

  async sendStartTimeSelection(to: string, locationId: string, targetDate: Date) {
    const availableStarts = await this.bookingEngine.getAvailableStartTimes(locationId, targetDate)
    if (!availableStarts || availableStarts.length === 0) {
      await this.sendText(to, 'Sorry, there are no available slots for this date.')
      return
    }

    const rows = availableStarts.slice(0, 10).map(st => {
      let hours = st.getHours()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      const mins = st.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${mins} ${ampm}`
      
      return { id: `time_${st.toISOString()}`, title: timeStr }
    })

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: 'Available Slots' },
        body: { text: 'Please select a start time (showing up to 10):' },
        footer: { text: 'Powered by TurfManager' },
        action: {
          button: 'View Slots',
          sections: [{ title: 'Times', rows }]
        }
      }
    }
    await this.sendRequest(payload)
  }

  async sendDurationSelection(to: string, locationId: string) {
    const settings = await this.bookingEngine.getLocationSettings(locationId)
    const minDuration = settings.min_duration_mins || 60
    
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'How long do you want to play?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: `duration_${minDuration}`, title: `${minDuration} Mins` } },
            { type: 'reply', reply: { id: `duration_${minDuration + 30}`, title: `${minDuration + 30} Mins` } },
            { type: 'reply', reply: { id: `duration_${minDuration + 60}`, title: `${minDuration + 60} Mins` } }
          ]
        }
      }
    }
    await this.sendRequest(payload)
  }

  async sendBookingConfirmation(phone: string, booking: any) {
    const st = new Date(booking.start_time).toLocaleString()
    const et = new Date(booking.end_time).toLocaleString()
    const text = `✅ Payment Received!\nYour booking is confirmed.\nStart: ${st}\nEnd: ${et}`
    await this.sendText(phone, text)
  }

  async processIncomingWebhook(data: any) {
    try {
      const entry = data.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      
      if (!value?.messages) return

      const message = value.messages[0]
      const senderPhone = message.from
      const msgType = message.type
      
      let locData = null
      
      if (data.location_id) {
         const { data: specificLoc } = await (this.bookingEngine as any).supabase
            .from('locations')
            .select('id, name, business_id')
            .eq('id', data.location_id)
            .single()
         locData = specificLoc
      } else {
         const { data: newestLoc } = await (this.bookingEngine as any).supabase
            .from('locations')
            .select('id, name, business_id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
         locData = newestLoc
      }
        
      if (!locData) {
        await this.sendText(senderPhone, 'System not configured with any locations yet.')
        return
      }
      const defaultLocation = locData
      
      if (!sessions[senderPhone]) {
        sessions[senderPhone] = { step: 'init', business_id: defaultLocation.business_id }
      }

      const session = sessions[senderPhone]

      if (msgType === 'text') {
        const textBody = message.text.body.toLowerCase()
        
        if (textBody.startsWith('book ')) {
          session.location_id = defaultLocation.id
          await this.bookingEngine.upsertCustomer(session.business_id, senderPhone, session.location_id)
          await this.sendDateSelection(senderPhone)
          session.step = 'date_selection'
        } else {
          const lastLoc = await this.bookingEngine.getCustomerLastLocation(session.business_id, senderPhone)
          if (lastLoc) {
            session.location_id = lastLoc
            await this.sendDateSelection(senderPhone)
            session.step = 'date_selection'
          } else {
            await this.sendText(senderPhone, "Hi! To book, please use the QR code at the turf or reply 'Book [Turf Name]'.")
          }
        }
      } else if (msgType === 'interactive') {
        const reply = message.interactive
        let replyId = ''
        
        if (reply.button_reply) {
          replyId = reply.button_reply.id
        } else if (reply.list_reply) {
          replyId = reply.list_reply.id
        } else {
          return
        }

        if (replyId.startsWith('date_')) {
          const dateStr = replyId.split('_')[1]
          session.date = new Date(dateStr)
          await this.sendStartTimeSelection(senderPhone, session.location_id, session.date)
          session.step = 'time_selection'
        } else if (replyId.startsWith('time_')) {
          const timeStr = replyId.substring(5) // time_2023-10-10...
          session.start_time = new Date(timeStr)
          await this.sendDurationSelection(senderPhone, session.location_id)
          session.step = 'duration_selection'
        } else if (replyId.startsWith('duration_')) {
          const durationMins = parseInt(replyId.split('_')[1], 10)
          const startTime = session.start_time
          
          const isAvailable = await this.bookingEngine.checkDurationAvailable(
            session.location_id, session.date, startTime, durationMins
          )
          
          if (!isAvailable) {
            await this.sendText(senderPhone, 'Sorry, someone just booked that slot! Please pick another time.')
            await this.sendDateSelection(senderPhone)
            return
          }
            
          const endTime = new Date(startTime)
          endTime.setMinutes(endTime.getMinutes() + durationMins)
          
          const settings = await this.bookingEngine.getLocationSettings(session.location_id)
          const amount = (settings.default_price || 1000) * (durationMins / 60.0)
          
          const customerId = await this.bookingEngine.upsertCustomer(session.business_id, senderPhone, session.location_id)
          const booking = await this.bookingEngine.createPendingBooking(
            session.location_id, customerId, startTime, endTime, amount
          )
          
          if (booking) {
            const link = this.razorpay.generatePaymentLink(amount, booking.id, senderPhone)
            await this.sendText(senderPhone, `Slot reserved for 5 minutes!\nPay ₹${amount} here: ${link}`)
            session.step = 'awaiting_payment'
          } else {
            await this.sendText(senderPhone, 'Failed to reserve slot due to a conflict. Try again.')
          }
        }
      }
    } catch (e) {
      console.error('Error processing webhook:', e)
    }
  }
}
