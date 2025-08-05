import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

console.log('Bids API route loaded'); // Debug log

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Fetch all bids
    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bids:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      totalBids: bids?.length || 0,
      pending: bids?.filter(bid => bid.status === 'pending').length || 0,
      won: bids?.filter(bid => bid.status === 'won').length || 0,
      lost: bids?.filter(bid => bid.status === 'lost').length || 0,
      totalValue: bids?.reduce((sum, bid) => sum + (bid.amount || 0), 0) || 0,
      avgScore: bids?.length > 0 
        ? Math.round(bids.reduce((sum, bid) => sum + (bid.score || 0), 0) / bids.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        bids: bids || [],
        stats
      }
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
    
    // Validate required fields
    const { client_name, address, service_type, amount } = body;
    
    if (!client_name || !address || !service_type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new bid
    const { data, error } = await supabase
      .from('bids')
      .insert([{
        client_name,
        address,
        service_type,
        amount: parseFloat(amount),
        score: body.score || 0,
        status: body.status || 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating bid:', error);
      return NextResponse.json(
        { error: 'Failed to create bid' },
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bid ID required' },
        { status: 400 }
      );
    }

    // Update bid
    const { data, error } = await supabase
      .from('bids')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bid:', error);
      return NextResponse.json(
        { error: 'Failed to update bid' },
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
        { error: 'Bid ID required' },
        { status: 400 }
      );
    }

    // Delete bid
    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bid:', error);
      return NextResponse.json(
        { error: 'Failed to delete bid' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bid deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}