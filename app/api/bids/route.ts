// app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET handler for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Bids API is working!', 
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /api/bids': 'Test endpoint',
      'POST /api/bids': 'Create new bid with communications'
    }
  })
}

// POST handler for creating bids
export async function POST(req: NextRequest) {
  console.log('[api/bids] POST invoked')
  
  try {
    const body = await req.json()
    console.log('[api/bids] body:', body)

    const { client_name, address, client_email, client_phone, amount } = body

    // Validate required fields
    if (!client_name || !address || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: client_name, address, amount' 
      }, { status: 400 })
    }

    console.log('[api/bids] Creating new bid...')

    // Insert the new bid
    const { data, error } = await supabase
      .from('bids')
      .insert({ 
        client_name, 
        address, 
        client_email, 
        client_phone, 
        service_type: 'Cleaning', 
        amount: parseFloat(amount), 
        status: 'pending',
        score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
      })
      .select()

    if (error) {
      console.error('[api/bids] Supabase insert error:', error)
      return NextResponse.json({ 
        error: 'Database insert error',
        details: error.message 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'Insert failed - no data returned' 
      }, { status: 500 })
    }

    const newBid = data[0]
    console.log('[api/bids] Created bid:', newBid.id)

    // Create communication schedule
    const now = new Date()
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

    const communications = [
      { 
        bid_id: newBid.id, 
        channel: 'email', 
        status: 'pending', 
        scheduled_at: now.toISOString(),
        attempt: 1
      },
      { 
        bid_id: newBid.id, 
        channel: 'sms', 
        status: 'pending', 
        scheduled_at: twoDaysLater.toISOString(),
        attempt: 2
      },
      { 
        bid_id: newBid.id, 
        channel: 'email', 
        status: 'pending', 
        scheduled_at: fiveDaysLater.toISOString(),
        attempt: 3
      }
    ]

    console.log('[api/bids] Creating communications schedule...')

    const { data: commData, error: commError } = await supabase
      .from('communications')
      .insert(communications)
      .select()

    if (commError) {
      console.error('[api/bids] Communications insert error:', commError)
      // Still return success since the bid was created
      return NextResponse.json({
        ...newBid,
        warning: 'Bid created but communications scheduling failed',
        commError: commError.message
      }, { status: 201 })
    }

    console.log('[api/bids] Created', commData?.length || 0, 'communications')

    return NextResponse.json({
      success: true,
      bid: newBid,
      communications: commData?.length || 0,
      message: `Successfully created bid and ${commData?.length || 0} communications`
    }, { status: 201 })

  } catch (error) {
    console.error('[api/bids] unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}