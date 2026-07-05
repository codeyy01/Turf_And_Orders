import crypto from 'crypto'

export class RazorpayService {
  private keyId: string
  private keySecret: string

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_key'
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
  }

  generatePaymentLink(amount: number, bookingId: string, customerPhone: string): string {
    // In a real implementation, call Razorpay API to create a payment link
    const mockLink = `upi://pay?pa=turf@razorpay&am=${amount}&tr=${bookingId}`
    return mockLink
  }

  verifyWebhookSignature(payloadBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret'
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBody)
      .digest('hex')
      
    try {
      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
    } catch (e) {
      return false
    }
  }
}
