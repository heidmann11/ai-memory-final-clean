'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BidsPage() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      console.log('🔍 Starting to fetch bids...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .limit(5);

      console.log('📊 Query result - data:', data);
      console.log('❌ Query result - error:', error);

      if (error) {
        throw error;
      }

      setBids(data || []);
      console.log('✅ Successfully set bids:', data?.length || 0);
      
    } catch (err) {
      console.error('💥 Error fetching bids:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading bids...</h1>
        <p>Check the browser console (F12) for debug info</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'red' }}>❌ Error Loading Bids</h1>
        <p><strong>Error:</strong> {error}</p>
        <button onClick={fetchBids}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>✅ Bids Loaded Successfully!</h1>
      <p><strong>Found {bids.length} bids</strong></p>
      
      {bids.length === 0 ? (
        <p>No bids found in database</p>
      ) : (
        <div>
          {bids.map((bid, index) => (
            <div key={bid.id} style={{ 
              border: '1px solid #ccc', 
              padding: '1rem', 
              margin: '1rem 0',
              borderRadius: '0.5rem'
            }}>
              <h3>{bid.client_name}</h3>
              <p>Amount: ${bid.amount}</p>
              <p>Status: {bid.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}