// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, jobId, messageType } = body

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Format phone number (ensure it starts with +1 for US numbers)
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`

    // Send SMS via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
      // Optional: Add status callback for delivery tracking
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/sms/status`
    })

    // Log the message for debugging
    console.log(`SMS sent to ${formattedPhone}: ${twilioMessage.sid}`)

    // Return success response
    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to: formattedPhone,
      message: message,
      jobId: jobId || null,
      messageType: messageType || 'manual',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('SMS sending error:', error)
    
    // Handle specific Twilio errors
    if (error.code === 21614) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }
    
    if (error.code === 21608) {
      return NextResponse.json(
        { error: 'Phone number is not verified (trial account)' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send SMS', details: error.message },
      { status: 500 }
    )
  }
}

// Handle incoming SMS webhooks from Twilio
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // This would handle incoming SMS messages
  // For now, just return status
  return NextResponse.json({
    status: 'Webhook endpoint ready',
    timestamp: new Date().toISOString()
  })
}