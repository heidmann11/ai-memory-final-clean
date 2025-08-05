import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Communication sequence templates
const COMMUNICATION_SEQUENCES = {
  new_bid: [
    {
      attempt: 1,
      channel: 'sms',
      delay_minutes: 0, // Immediate
      template: 'initial_contact',
      message: `Hi {customer_name}! Thanks for your interest in our {service_type} services. We've prepared a personalized quote for {address}. Can we schedule a quick call to discuss? - Route & Retain`
    },
    {
      attempt: 2,
      channel: 'email',
      delay_minutes: 60, // 1 hour later
      template: 'detailed_proposal',
      subject: 'Your {service_type} Quote - Route & Retain',
      message: `Dear {customer_name},\n\nThank you for considering Route & Retain for your {service_type} needs at {address}.\n\nWe've prepared a detailed quote of {amount} for your project. This includes:\n- Professional {service_type} service\n- All necessary equipment and supplies\n- Satisfaction guarantee\n\nWould you like to schedule a convenient time to discuss this proposal?\n\nBest regards,\nRoute & Retain Team`
    },
    {
      attempt: 3,
      channel: 'sms',
      delay_minutes: 1440, // 24 hours later
      template: 'follow_up',
      message: `Hi {customer_name}, just checking in about your {service_type} quote for {address}. Any questions? We're here to help! Reply YES to move forward or CALL to speak with someone. - Route & Retain`
    },
    {
      attempt: 4,
      channel: 'sms',
      delay_minutes: 4320, // 72 hours later
      template: 'final_follow_up',
      message: `Last chance! {customer_name}, your {service_type} quote for {address} expires soon. Reply NOW to secure your {amount} rate, or we'll mark this as closed. Thanks! - Route & Retain`
    }
  ],
  won_bid: [
    {
      attempt: 1,
      channel: 'sms',
      delay_minutes: 0,
      template: 'congratulations',
      message: `Fantastic news {customer_name}! Welcome to Route & Retain! We'll be in touch within 24 hours to schedule your {service_type} service at {address}. Get ready for amazing results! 🎉`
    },
    {
      attempt: 2,
      channel: 'email',
      delay_minutes: 60,
      template: 'welcome_package',
      subject: 'Welcome to Route & Retain - Next Steps',
      message: `Dear {customer_name},\n\nWelcome to the Route & Retain family! We're thrilled to provide your {service_type} service.\n\nNext Steps:\n1. We'll contact you within 24 hours to schedule\n2. Our team will arrive with all necessary equipment\n3. We'll complete the work to your satisfaction\n\nProject Details:\n- Service: {service_type}\n- Location: {address}\n- Investment: {amount}\n\nQuestions? Reply to this email or call us anytime.\n\nThank you for choosing Route & Retain!\n\nBest regards,\nThe Route & Retain Team`
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bid_id');
    const status = searchParams.get('status');

    let query = supabase.from('communications').select(`
      *,
      bids (
        client_name,
        address,
        service_type,
        amount,
        client_email,
        client_phone
      )
    `);

    if (bidId) {
      query = query.eq('bid_id', bidId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: communications, error } = await query
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching communications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch communications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: communications || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bid_id, sequence_type = 'new_bid', custom_message } = body;

    if (action === 'create_sequence') {
      // Create communication sequence for a bid
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bid_id)
        .single();

      if (bidError || !bid) {
        return NextResponse.json(
          { error: 'Bid not found' },
          { status: 404 }
        );
      }

      const sequence = COMMUNICATION_SEQUENCES[sequence_type as keyof typeof COMMUNICATION_SEQUENCES];
      if (!sequence) {
        return NextResponse.json(
          { error: 'Invalid sequence type' },
          { status: 400 }
        );
      }

      // Create scheduled communications
      const now = new Date();
      const communicationsToCreate = sequence.map((step) => {
        const scheduledAt = new Date(now.getTime() + (step.delay_minutes * 60 * 1000));
        
        // Replace template variables
        let message = step.message
          .replace(/{customer_name}/g, bid.client_name || 'Valued Customer')
          .replace(/{address}/g, bid.address || 'your location')
          .replace(/{service_type}/g, bid.service_type || 'service')
          .replace(/{amount}/g, bid.amount ? `${bid.amount}` : '$[Amount]');

        return {
          bid_id: bid_id,
          channel: step.channel,
          attempt: step.attempt,
          template: step.template,
          message: message,
          subject: step.subject?.replace(/{service_type}/g, bid.service_type || 'Service'),
          scheduled_at: scheduledAt.toISOString(),
          status: 'scheduled',
          recipient_phone: bid.client_phone,
          recipient_email: bid.client_email
        };
      });

      const { data: createdComms, error: createError } = await supabase
        .from('communications')
        .insert(communicationsToCreate)
        .select();

      if (createError) {
        console.error('Error creating communications:', createError);
        return NextResponse.json(
          { error: 'Failed to create communication sequence' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Created ${createdComms.length} communications for ${sequence_type} sequence`,
        data: createdComms
      });

    } else if (action === 'send_now') {
      // Send a communication immediately
      const { communication_id } = body;

      const { data: comm, error: commError } = await supabase
        .from('communications')
        .select(`
          *,
          bids (
            client_name,
            client_email,
            client_phone
          )
        `)
        .eq('id', communication_id)
        .single();

      if (commError || !comm) {
        return NextResponse.json(
          { error: 'Communication not found' },
          { status: 404 }
        );
      }

      // Mock sending (in production, integrate with Twilio, SendGrid, etc.)
      const success = await mockSendCommunication(comm);

      if (success) {
        // Update communication status
        const { error: updateError } = await supabase
          .from('communications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', communication_id);

        if (updateError) {
          console.error('Error updating communication status:', updateError);
        }

        return NextResponse.json({
          success: true,
          message: `${comm.channel.toUpperCase()} sent successfully`
        });
      } else {
        // Update communication status to failed
        const { error: updateError } = await supabase
          .from('communications')
          .update({
            status: 'failed',
            sent_at: new Date().toISOString()
          })
          .eq('id', communication_id);

        return NextResponse.json(
          { error: `Failed to send ${comm.channel}` },
          { status: 500 }
        );
      }

    } else if (action === 'send_custom') {
      // Send a custom message
      const { bid_id, channel, message, subject } = body;

      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('id', bid_id)
        .single();

      if (bidError || !bid) {
        return NextResponse.json(
          { error: 'Bid not found' },
          { status: 404 }
        );
      }

      // Create and send custom communication
      const customComm = {
        bid_id: bid_id,
        channel: channel,
        attempt: 0, // Custom messages don't have attempt numbers
        template: 'custom',
        message: message,
        subject: subject,
        scheduled_at: new Date().toISOString(),
        status: 'scheduled',
        recipient_phone: bid.client_phone,
        recipient_email: bid.client_email
      };

      const { data: createdComm, error: createError } = await supabase
        .from('communications')
        .insert([customComm])
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create custom communication' },
          { status: 500 }
        );
      }

      // Send immediately
      const success = await mockSendCommunication({
        ...createdComm,
        bids: [bid]
      });

      // Update status
      await supabase
        .from('communications')
        .update({
          status: success ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })
        .eq('id', createdComm.id);

      return NextResponse.json({
        success: success,
        message: success ? `Custom ${channel} sent successfully` : `Failed to send ${channel}`,
        data: createdComm
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Communication ID required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (status === 'sent' || status === 'failed') {
      updates.sent_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('communications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating communication:', error);
      return NextResponse.json(
        { error: 'Failed to update communication' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Communication ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting communication:', error);
      return NextResponse.json(
        { error: 'Failed to delete communication' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Communication deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock function to simulate sending communications
async function mockSendCommunication(communication: any): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`📱 Mock ${communication.channel.toUpperCase()} sent to:`, 
    communication.channel === 'sms' ? communication.recipient_phone : communication.recipient_email
  );
  console.log(`📝 Message:`, communication.message);
  
  if (communication.subject) {
    console.log(`📧 Subject:`, communication.subject);
  }

  // Mock 95% success rate
  return Math.random() > 0.05;
}