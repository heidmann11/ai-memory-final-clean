// app/api/sms/status/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract Twilio status callback data
    const messageId = formData.get('MessageSid') as string
    const messageStatus = formData.get('MessageStatus') as string
    const to = formData.get('To') as string
    const from = formData.get('From') as string
    const errorCode = formData.get('ErrorCode') as string
    const errorMessage = formData.get('ErrorMessage') as string

    // Log the status update
    console.log('SMS Status Update:', {
      messageId,
      status: messageStatus,
      to,
      from,
      errorCode,
      errorMessage
    })

    // In a real app, you would:
    // 1. Update the message status in your database
    // 2. Potentially notify the user via websockets
    // 3. Track delivery metrics
    
    // For now, we'll just log and return success
    return NextResponse.json({ 
      success: true, 
      messageId,
      status: messageStatus 
    })

  } catch (error) {
    console.error('SMS status callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process status callback' },
      { status: 500 }
    )
  }
}