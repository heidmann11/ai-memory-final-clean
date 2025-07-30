'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BidsPage() {
  const [bids, setBids] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    fetchBidsAndCommunications();
  }, []);

  const fetchBidsAndCommunications = async () => {
    try {
      setLoading(true);
      
      // Fetch real bids from Supabase
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        throw bidsError;
      }

      // Fetch real communications from Supabase
      const { data: commsData, error: commsError } = await supabase
        .from('communications')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (commsError) {
        console.error('Error fetching communications:', commsError);
        throw commsError;
      }

      console.log('Fetched bids:', bidsData);
      console.log('Fetched communications:', commsData);

      setBids(bidsData || []);
      setCommunications(commsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show user-friendly error message
      setBids([]);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e' },
      won: { bg: '#d1fae5', text: '#065f46' },
      lost: { bg: '#fee2e2', text: '#991b1b' },
      sent: { bg: '#dbeafe', text: '#1e40af' },
      delivered: { bg: '#e9d5ff', text: '#7c2d12' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#059669';
    if (score >= 75) return '#d97706';
    return '#dc2626';
  };

  const getBidCommunications = (bidId) => {
    return communications.filter(comm => comm.bid_id === bidId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const BidCard = ({ bid }) => {
    const bidComms = getBidCommunications(bid.id);
    const isExpanded = selectedBid === bid.id;
    const statusColors = getStatusColor(bid.status);

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s',
        marginBottom: '1rem'
      }}>
        <div 
          style={{
            padding: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedBid(isExpanded ? null : bid.id)}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '1rem' 
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '0.25rem',
                margin: '0 0 0.25rem 0'
              }}>
                {bid.client_name}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem 0'
              }}>
                {bid.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: statusColors.bg,
                  color: statusColors.text
                }}>
                  {bid.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {bid.service_type}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '0.25rem' 
              }}>
                {formatCurrency(bid.amount)}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: getScoreColor(bid.score) 
              }}>
                Score: {bid.score}%
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {bid.client_email && (
                <div style={{ marginBottom: '0.25rem' }}>📧 {bid.client_email}</div>
              )}
              {bid.client_phone && (
                <div>📱 {bid.client_phone}</div>
              )}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {bidComms.length} communications scheduled
            </div>
          </div>
        </div>

        {/* Expanded Communication Details */}
        {isExpanded && (
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '1.5rem',
            backgroundColor: '#f9fafb'
          }}>
            <h4 style={{ 
              fontWeight: '500', 
              color: '#111827', 
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>
              Communication Schedule
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bidComms.map((comm) => {
                const commStatusColors = getStatusColor(comm.status);
                return (
                  <div 
                    key={comm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.25rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        {comm.channel === 'email' ? '📧' : '📱'}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500', 
                          color: '#111827' 
                        }}>
                          {comm.channel.toUpperCase()} - Attempt {comm.attempt}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280' 
                        }}>
                          Scheduled: {formatDate(comm.scheduled_at)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: commStatusColors.bg,
                      color: commStatusColors.text
                    }}>
                      {comm.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    won: bids.filter(b => b.status === 'won').length,
    lost: bids.filter(b => b.status === 'lost').length,
    totalValue: bids.reduce((sum, bid) => sum + bid.amount, 0),
    avgScore: bids.length > 0 ? Math.round(bids.reduce((sum, bid) => sum + bid.score, 0) / bids.length) : 0
  };

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 4rem)',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            width: '3rem',
            height: '3rem',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 4rem)',
      backgroundColor: '#f9fafb',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '0.5rem',
          margin: '0 0 0.5rem 0'
        }}>
          Bid Management
        </h1>
        <p style={{ color: '#6b7280', margin: '0' }}>
          Track and manage your cleaning service bids
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Bids', value: stats.total, color: '#111827' },
          { label: 'Pending', value: stats.pending, color: '#d97706' },
          { label: 'Won', value: stats.won, color: '#059669' },
          { label: 'Lost', value: stats.lost, color: '#dc2626' },
          { label: 'Total Value', value: formatCurrency(stats.totalValue), color: '#2563eb' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, color: '#7c3aed' }
        ].map((stat, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: stat.color 
            }}>
              {stat.value}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280' 
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bids List */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#111827',
            margin: '0'
          }}>
            All Bids ({bids.length})
          </h2>
          <button 
            onClick={fetchBidsAndCommunications}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Refresh
          </button>
        </div>
        {bids.map(bid => (
          <BidCard key={bid.id} bid={bid} />
        ))}
      </div>
    </div>
  );
}