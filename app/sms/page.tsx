'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare, User, CalendarDays, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react'

interface Job {
  id: string
  customer_name: string | null
  address: string | null
  lat: number | null
  lng: number | null
  service: string | null
  priority: string | null
  status: string | null
  estimated_duration: number | null
  title: string | null
  description: string | null
  scheduled_start: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  estimated_cost: number | null
  created_at: string
}

export default function SMSCenterPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('🔍 Attempting to fetch jobs from Supabase...')
        const supabase = createClient()
        
        // Let's first try to get just one row to see what columns exist
        const { data: sampleData, error: sampleError } = await supabase
          .from('jobs')
          .select('*')
          .limit(1)
        
        if (sampleError) {
          console.error('❌ Error getting sample data:', sampleError)
          // If that fails, try without ordering by created_at
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .limit(10)
          
          if (error) {
            console.error('❌ Error fetching jobs without ordering:', error)
            throw error
          }
          
          console.log('✅ Jobs fetched without ordering:', data)
          setJobs(data || [])
        } else {
          console.log('✅ Sample job data:', sampleData)
          if (sampleData && sampleData.length > 0) {
            console.log('📋 Available columns:', Object.keys(sampleData[0]))
          }
          
          // Now try to get all jobs, but handle the created_at issue
          let query = supabase.from('jobs').select('*')
          
          // Check if created_at column exists, if not, don't order
          if (sampleData && sampleData.length > 0 && 'created_at' in sampleData[0]) {
            query = query.order('created_at', { ascending: false })
          } else if (sampleData && sampleData.length > 0 && 'id' in sampleData[0]) {
            query = query.order('id', { ascending: false })
          }
          
          const { data, error } = await query
          
          if (error) {
            console.error('❌ Error fetching all jobs:', error)
            throw error
          }
          
          console.log('✅ Successfully fetched jobs:', data)
          console.log('📊 Number of jobs found:', data?.length || 0)
          setJobs(data || [])
        }
        
      } catch (error) {
        console.error('💥 Complete failure fetching jobs:', error)
        // Fallback to mock data if everything fails
        const mockJobs: Job[] = [
          {
            id: 'mock-1',
            title: 'HVAC Maintenance (Mock Data - Check Console)',
            customer_name: 'John Smith',
            address: '123 Main St, Baltimore, MD',
            service: 'HVAC Maintenance',
            status: 'pending',
            priority: 'medium',
            estimated_duration: 90,
            lat: null,
            lng: null,
            description: null,
            scheduled_start: null,
            city: 'Baltimore',
            state: 'MD',
            zip_code: '21201',
            estimated_cost: 150,
            created_at: new Date().toISOString()
          }
        ]
        setJobs(mockJobs)
      }
    }

    fetchJobs()
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !message) {
      alert('Recipient and Message cannot be empty!')
      return
    }
    alert(`SMS sent to ${recipient} at ${scheduledTime || 'now'}: "${message}"`)
    setRecipient('')
    setMessage('')
    setScheduledTime('')
  }

  const handleSMSClick = (job: Job) => {
    setRecipient(job.customer_name || 'Customer')
    setMessage(`Hi ${job.customer_name || 'there'}, your technician is on the way for ${job.title || job.service || 'your service'}. We'll contact you upon arrival.`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const quickMessages = [
    "Hi! Your technician is on the way and will arrive within 30 minutes.",
    "We've completed your service. Thank you for choosing Route & Retain!",
    "Your appointment is scheduled for today. We'll call 15 minutes before arrival.",
    "Weather delay: We'll reschedule your outdoor service for tomorrow.",
    "Service complete! Please let us know if you have any questions."
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">SMS Communication Center</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Job List with SMS/Complete Buttons */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
            <div className="bg-white/10 border-b border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Active Jobs & Customers
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                          <div className="flex items-center gap-2 text-white/80 mb-1">
                            <User className="h-4 w-4" />
                            <span>{job.customer_name}</span>
                          </div>
                          {(job as any).phone_number && (
                            <div className="flex items-center gap-2 text-white/80 mb-1">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{(job as any).phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white/80 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{job.address}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status || "unknown")}`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-white/60 mb-4">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Created: {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors duration-200"
                          onClick={() => handleSMSClick(job)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          Send SMS
                        </button>
                        <button
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors duration-200"
                          onClick={() => alert(`Marked ${job.title || job.service || 'job'} as complete.`)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-white/60">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-white/40" />
                    <p className="text-lg font-medium">No Active Jobs</p>
                    <p className="text-sm">Jobs will appear here when created</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: SMS Send Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
            <div className="bg-white/10 border-b border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-orange-400" />
                Send New SMS
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSendMessage} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Recipient</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Phone number or customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    placeholder="Write your message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Schedule (optional)</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  Send SMS
                </button>
              </form>

              {/* Quick Message Templates */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Quick Message Templates</h3>
                <div className="space-y-2">
                  {quickMessages.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(template)}
                      className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/80 text-sm transition-all duration-200"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-blue-100">Messages Sent Today</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-green-100">Delivery Rate</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">4.2</div>
            <div className="text-sm text-purple-100">Avg Response Time</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-orange-100">Active Conversations</div>
          </div>
        </div>
      </div>
    </div>
  )
}