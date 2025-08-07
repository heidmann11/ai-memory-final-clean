'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Clock,
  Navigation,
  MessageSquare,
  Camera,
  RefreshCw,
  Play,
  CheckCircle2,
  DollarSign,
  Route,
  Zap,
  Calendar,
  TrendingUp,
  Users,
  Star,
  Key,
  Shield,
  X,
  ExternalLink,
  AlertCircle,
  Send,
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  Phone,
  Image
} from 'lucide-react';

interface ScheduledJob {
  id: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  service: string;
  recurrence: string;
  estimated_duration: number;
  estimated_cost: number;
  status: string;
  priority: string;
  description?: string;
  scheduled_start?: string;
  route_sequence?: number;
  drive_time_from_previous?: number;
  customer_phone?: string;
  customer_email?: string;
  due_amount?: number;
  job_amount?: number;
  assigned_employees?: string;
}

interface RouteMetrics {
  totalRevenue: number;
  totalWorkTime: number;
  totalDriveTime: number;
  efficiency: number;
  jobCount: number;
  avgRevenuePerHour: number;
}

// Helper function to format date without timezone issues
const formatSelectedDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString();
};

export default function OperationsPage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [routeMetrics, setRouteMetrics] = useState<RouteMetrics>({
    totalRevenue: 0,
    totalWorkTime: 0,
    totalDriveTime: 0,
    efficiency: 0,
    jobCount: 0,
    avgRevenuePerHour: 0
  });
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Enhanced SMS Modal States
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsDelivered, setSmsDelivered] = useState(false);
  const [currentJob, setCurrentJob] = useState<ScheduledJob | null>(null);

  // Enhanced Photo Modal States
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoCategory, setPhotoCategory] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Enhanced SMS Templates
  const messageTemplates = {
    onWay: (job: ScheduledJob) => `Hi ${job.customer_name}! This is SWC Cleaners. Yenssi & Heidi are on their way to your home at ${job.address}. We'll be there at ${job.scheduled_start ? new Date(job.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'soon'}. Please ensure access to your property. Thanks! 🚐`,
    
    arrived: (job: ScheduledJob) => `Hello ${job.customer_name}! SWC Cleaners has arrived at your property. We're starting your ${job.service} service now. Estimated completion: ${job.estimated_duration || 120} minutes. 🏠`,
    
    complete: (job: ScheduledJob) => `Hi ${job.customer_name}! We've finished your ${job.service} service at ${job.address}. Your home is sparkling clean! Payment of $${getRevenueFromJob(job)} can be made via cash, check, or Venmo. Thank you for choosing SWC Cleaners! ✨`,
    
    feedback: (job: ScheduledJob) => `Hi ${job.customer_name}! We hope you love your freshly cleaned home! How did we do today? Your feedback helps us serve you better. Please reply or call us at (703) 555-0123. Thank you for trusting SWC Cleaners! ⭐`,
    
    reminder: (job: ScheduledJob) => `Hi ${job.customer_name}! Reminder: Your ${job.service} is scheduled for today at ${job.scheduled_start ? new Date(job.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}. We'll see you soon! 📅`,
    
    reschedule: (job: ScheduledJob) => `Hi ${job.customer_name}, we need to reschedule your ${job.service} service. Please reply with your preferred time or call us at (703) 555-0123. Thank you for your understanding! 🔄`
  };

  // Template selection handler
  const handleTemplateSelect = (templateKey: string) => {
    if (!currentJob) return;
    setSelectedTemplate(templateKey);
    const template = messageTemplates[templateKey as keyof typeof messageTemplates];
    if (template) {
      setMessageText(template(currentJob));
    }
  };

  // Enhanced SMS function
  const openSmsModal = (job: ScheduledJob) => {
    console.log('Opening SMS modal for:', job.customer_name);
    setCurrentJob(job);
    setMessageText('');
    setSelectedTemplate('onWay');
    setSending(false);
    setSmsSent(false);
    setSmsDelivered(false);
    setSmsModalOpen(true);
    
    // Auto-select "On Our Way" template
    setTimeout(() => {
      setMessageText(messageTemplates.onWay(job));
    }, 100);
  };

  // Enhanced Photo function
  const openPhotoModal = (job: ScheduledJob) => {
    console.log('Opening photo modal for:', job.customer_name);
    setCurrentJob(job);
    setSelectedFiles([]);
    setPhotoCategory('');
    setPhotoNotes('');
    setUploading(false);
    setUploadProgress(0);
    setPhotoModalOpen(true);
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (smsModalOpen) {
          resetSmsModal();
          setSmsModalOpen(false);
        } else if (photoModalOpen) {
          resetPhotoModal();
          setPhotoModalOpen(false);
        }
      }
    };

    if (smsModalOpen || photoModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [smsModalOpen, photoModalOpen]);

  // SMS sending function
  const handleSendSMS = async () => {
    if (!messageText.trim() || !currentJob) return;
    
    setSending(true);
    
    try {
      // Simulate SMS sending (replace with real API call)
      console.log('Sending SMS to:', currentJob.customer_phone);
      console.log('Message:', messageText);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just simulate success
      setSending(false);
      setSmsSent(true);
      
      // Simulate delivery confirmation
      setTimeout(() => {
        setSmsDelivered(true);
      }, 1500);
      
      // Auto close after success
      setTimeout(() => {
        resetSmsModal();
        setSmsModalOpen(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('SMS Error:', err);
      setSending(false);
      setError('Failed to send SMS: ' + err.message);
    }
  };

  // Photo upload function
  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0 || !photoCategory || !currentJob) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log(`Uploading ${selectedFiles.length} photos for:`, currentJob.customer_name);
      console.log('Category:', photoCategory);
      console.log('Notes:', photoNotes);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploading(false);
              setPhotoModalOpen(false);
              resetPhotoModal();
              alert(`✅ Successfully uploaded ${selectedFiles.length} photos for ${currentJob.customer_name}!`);
            }, 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
    } catch (err: any) {
      console.error('Photo Upload Error:', err);
      setUploading(false);
      setError('Failed to upload photos: ' + err.message);
    }
  };

  // File selection handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  // Character count utilities
  const getCharacterCount = () => messageText.length;
  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count > 140) return 'text-red-500';
    if (count > 120) return 'text-yellow-500';
    return 'text-gray-500';
  };

  // Reset functions
  const resetSmsModal = () => {
    setMessageText('');
    setSelectedTemplate('');
    setSending(false);
    setSmsSent(false);
    setSmsDelivered(false);
  };

  const resetPhotoModal = () => {
    setSelectedFiles([]);
    setPhotoCategory('');
    setPhotoNotes('');
    setUploading(false);
    setUploadProgress(0);
  };

  // Memoized calculate metrics function
  const calculateMetrics = useCallback((jobList: ScheduledJob[]) => {
    const totalRevenue = jobList.reduce((sum, job) => {
      const revenue = job.job_amount || job.due_amount || job.estimated_cost || 0;
      return sum + revenue;
    }, 0);
    const totalWorkTime = jobList.reduce((sum, job) => sum + (job.estimated_duration || 0), 0);
    const totalDriveTime = jobList.reduce((sum, job) => sum + (job.drive_time_from_previous || 0), 0);
    const efficiency = totalWorkTime > 0 ? (totalWorkTime / (totalWorkTime + totalDriveTime)) * 100 : 0;
    const avgRevenuePerHour = totalWorkTime > 0 ? (totalRevenue / (totalWorkTime / 60)) : 0;

    setRouteMetrics({
      totalRevenue,
      totalWorkTime,
      totalDriveTime,
      efficiency,
      jobCount: jobList.length,
      avgRevenuePerHour
    });
  }, []);

  // Generate jobs for a specific date based on existing swc_jobs data
  const generateJobsForDate = useCallback(async (targetDate: string) => {
    try {
      console.log(`🗓️ Loading jobs for: ${targetDate}`);
      
      // First, try to get jobs already scheduled for this exact date
      const { data: scheduledJobs, error: scheduledError } = await supabase
        .from('swc_jobs')
        .select('*')
        .gte('scheduled_start', `${targetDate}T00:00:00`)
        .lt('scheduled_start', `${targetDate}T23:59:59`)
        .order('scheduled_start');

      if (scheduledError) {
        console.log('No scheduled jobs found, generating from templates...');
      }

      // If we have scheduled jobs for this date, filter out fake ones and use real ones only
      if (scheduledJobs && scheduledJobs.length > 0) {
        const realScheduledJobs = scheduledJobs.filter(job => 
          job.customer_name !== 'Jane Doe' && 
          !job.address?.includes('Unknown') &&
          !job.address?.includes('Elm Ave') &&
          job.city !== 'Unknown City'
        );
        
        console.log(`📅 Found ${scheduledJobs.length} total scheduled jobs for ${targetDate}`);
        console.log(`🧹 After filtering fake jobs: ${realScheduledJobs.length} real scheduled jobs`);
        
        if (realScheduledJobs.length > 0) {
          console.log(`✅ Using real scheduled jobs:`, realScheduledJobs.map(j => j.customer_name));
          return realScheduledJobs;
        }
        
        console.log(`⚠️ All scheduled jobs were fake - generating from templates instead`);
      }

      // Otherwise, generate jobs from existing customer data
      const { data: allJobs, error } = await supabase
        .from('swc_jobs')
        .select('*')
        .order('customer_name');
      
      if (error) throw error;

      // Parse date safely without timezone issues
      const [year, month, day] = targetDate.split('-').map(Number);
      const targetDateObj = new Date(year, month - 1, day); // month is 0-indexed
      const dayOfWeek = targetDateObj.getDay(); // 0=Sunday, 6=Saturday
      
      // Debug: Show exactly what day we think this is
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const calculatedDayName = dayNames[dayOfWeek];
      
      console.log(`📅 Date Analysis for ${targetDate}:`);
      console.log(`   Parsed as: ${year}-${month}-${day}`);
      console.log(`   Date object: ${targetDateObj.toDateString()}`);
      console.log(`   Day of week number: ${dayOfWeek}`);
      console.log(`   Calculated day name: ${calculatedDayName}`);
      console.log(`   Should have jobs: ${dayOfWeek >= 1 && dayOfWeek <= 5 ? 'YES (weekday)' : 'NO (weekend)'}`);
      
      console.log(`📋 Found ${allJobs?.length || 0} total jobs in database`);
      
      // Only work on weekdays (Monday=1 through Friday=5)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`🚫 ${calculatedDayName} is a weekend - no jobs scheduled`);
        return [];
      }
      
      console.log(`✅ ${calculatedDayName} is a weekday - generating jobs...`);

      // Filter to only real customer data (not fake test data)
      let availableJobs = (allJobs || []).filter(job => {
        const isRealCustomer = job.customer_name && 
          job.customer_name !== 'Jane Doe' && 
          job.address && 
          !job.address.includes('Unknown') &&
          !job.address.includes('Elm Ave') && // Filter out fake addresses
          job.city &&
          job.city !== 'Unknown City';
        
        if (!isRealCustomer) {
          console.log(`🚫 Filtered out fake job: ${job.customer_name} at ${job.address}`);
        }
        return isRealCustomer;
      });
      
      console.log(`🧹 Found ${availableJobs.length} real customer jobs (filtered out test data)`);
      console.log(`📋 Real customers:`, availableJobs.map(j => `${j.customer_name} (${j.city})`));
      
      // If no real customers found, return empty (don't fall back to fake data)
      if (availableJobs.length === 0) {
        console.log('❌ No real customers found - returning empty schedule');
        return [];
      }
      
      // Create a pool of jobs for selection, but ensure unique selection
      console.log(`🔄 Original pool size: ${availableJobs.length} unique customers`);

      // Use consistent day-based selection (not random)  
      const dayBasedSeed = (dayOfWeek * 7) + (new Date(targetDate).getDate() % 7);
      
      // Select 3-4 jobs consistently for this date
      const jobCount = 3 + ((dayOfWeek + new Date(targetDate).getDate()) % 2);
      
      // Ensure we select unique customers by shuffling and taking unique entries
      const shuffledCustomers = [...availableJobs].sort(() => (dayBasedSeed % 2 === 0) ? -1 : 1);
      
      // Select unique customers by customer name
      const selectedCustomers = [];
      const usedCustomerNames = new Set();
      
      for (let i = 0; i < shuffledCustomers.length && selectedCustomers.length < jobCount; i++) {
        const customer = shuffledCustomers[i];
        if (!usedCustomerNames.has(customer.customer_name)) {
          selectedCustomers.push(customer);
          usedCustomerNames.add(customer.customer_name);
        }
      }
      
      // If we still don't have enough unique customers, wrap around with different service types
      while (selectedCustomers.length < jobCount && availableJobs.length > 0) {
        const fallbackCustomer = availableJobs[selectedCustomers.length % availableJobs.length];
        if (!usedCustomerNames.has(`${fallbackCustomer.customer_name}_fallback`)) {
          selectedCustomers.push({
            ...fallbackCustomer,
            id: `${fallbackCustomer.id}_alt`, // Make unique ID
            service: fallbackCustomer.service + ' (Additional Service)' // Distinguish service
          });
          usedCustomerNames.add(`${fallbackCustomer.customer_name}_fallback`);
        }
      }
      
      const dayBasedSelection = selectedCustomers.slice(0, jobCount);
      
      console.log(`🎯 Selected unique customers for ${targetDate}:`, dayBasedSelection.map(j => j.customer_name));
      
      // Create new scheduled jobs from existing customer templates
      const scheduledJobsForDate = dayBasedSelection.map((job, index) => ({
        ...job,
        id: `${job.id}_${targetDate}_${index}`, // Make unique ID for the scheduled version
        scheduled_start: `${targetDate}T${8 + (index * 2.5)}:${(index * 15) % 60 < 10 ? '0' : ''}${(index * 15) % 60}:00`,
        route_sequence: index + 1,
        drive_time_from_previous: index === 0 ? 15 : 20 + Math.floor(Math.random() * 15),
        status: 'pending' as const // Reset to pending for new scheduling
      }));

      console.log(`✨ Generated ${scheduledJobsForDate.length} jobs for ${targetDate}:`, 
        scheduledJobsForDate.map(j => j.customer_name));
      
      return scheduledJobsForDate;
      
    } catch (err: any) {
      console.error('Error generating jobs for date:', err);
      throw err;
    }
  }, [supabase]);

  // Load jobs for specific date
  const loadJobsForDate = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);

    try {
      const jobData = await generateJobsForDate(date);
      
      const formattedJobs: ScheduledJob[] = jobData.map(job => ({
        id: job.id,
        customer_name: job.customer_name || 'Unknown Customer',
        address: job.address || 'No Address',
        city: job.city || 'Unknown City',
        state: job.state || 'VA',
        service: job.service || 'Cleaning Service',
        recurrence: job.recurrence || 'weekly',
        estimated_duration: job.estimated_duration || 120,
        estimated_cost: job.estimated_cost || 150,
        priority: job.priority || 'medium',
        status: job.status || 'pending',
        description: job.description,
        scheduled_start: job.scheduled_start,
        route_sequence: job.route_sequence,
        drive_time_from_previous: job.drive_time_from_previous,
        customer_phone: job.customer_phone,
        customer_email: job.customer_email,
        due_amount: job.due_amount,
        job_amount: job.job_amount,
        assigned_employees: job.assigned_employees
      }));

      setJobs(formattedJobs);
      calculateMetrics(formattedJobs);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError(`Failed to load jobs for ${date}: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [generateJobsForDate, calculateMetrics]);

  // Update job status
  const updateJobStatus = async (jobId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      // Update local state since we're generating jobs dynamically
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
      
      console.log(`Updated job ${jobId} to ${newStatus}`);
      
      // Show success message
      const job = jobs.find(j => j.id === jobId);
      const statusMessage = newStatus === 'in_progress' ? 'started' : 
                           newStatus === 'completed' ? 'completed' : newStatus;
      alert(`✅ ${job?.customer_name || 'Job'} ${statusMessage}!`);
      
    } catch (err: any) {
      console.error('Error updating job status:', err);
      setError(`Failed to update job status: ${err.message || 'Unknown error'}`);
    }
  };

  // Clean up address for Google Maps (remove duplicate city/state info)
  const cleanAddress = (address: string, city: string, state: string) => {
    let cleanAddr = address
      .replace(/,\s*\d+,\s*VA$/, '') // Remove trailing ", 410, VA" type patterns
      .replace(/,\s*Unknown City.*$/, '') // Remove "Unknown City" parts
      .trim();
    
    return `${cleanAddr}, ${city}, ${state}`;
  };

  // Optimize route
  const optimizeRoute = async () => {
    if (jobs.length === 0) {
      setError('No jobs to optimize');
      return;
    }

    setOptimizing(true);
    setError(null);

    try {
      // Simple optimization: assign route sequences and estimated times
      const optimizedJobs = jobs.map((job, index) => ({
        ...job,
        route_sequence: index + 1,
        scheduled_start: `${selectedDate}T${8 + Math.floor(index * 2.5)}:${(index * 30) % 60 < 10 ? '0' : ''}${(index * 30) % 60}:00`,
        drive_time_from_previous: index === 0 ? 15 : 20 + Math.floor(Math.random() * 15)
      }));

      setJobs(optimizedJobs);
      calculateMetrics(optimizedJobs);
      
      // Show Google Maps with the optimized route
      setShowMapModal(true);
    } catch (err: any) {
      console.error('Error optimizing route:', err);
      setError(`Failed to optimize route: ${err.message || 'Unknown error'}`);
    } finally {
      setOptimizing(false);
    }
  };

  // Generate Google Maps URL with route
  const generateGoogleMapsUrl = useCallback(() => {
    if (jobs.length === 0) return '';
    
    const sortedJobs = jobs
      .filter(job => job.route_sequence && job.address)
      .sort((a, b) => (a.route_sequence || 0) - (b.route_sequence || 0));
    
    if (sortedJobs.length === 0) return '';
    
    // Use cleaned addresses for better Google Maps compatibility
    const origin = encodeURIComponent(cleanAddress(sortedJobs[0].address, sortedJobs[0].city, sortedJobs[0].state));
    const destination = encodeURIComponent(cleanAddress(
      sortedJobs[sortedJobs.length - 1].address, 
      sortedJobs[sortedJobs.length - 1].city, 
      sortedJobs[sortedJobs.length - 1].state
    ));
    const waypoints = sortedJobs
      .slice(1, -1)
      .map(job => encodeURIComponent(cleanAddress(job.address, job.city, job.state)))
      .join('/'); // Join waypoints with '/' for the Google Maps URL
    
    // Correct Google Maps URL format
    let url = `https://www.google.com/maps/dir/${origin}`;
    if (waypoints) {
      url += `/${waypoints}`;
    }
    url += `/${destination}`;
    
    return url;
  }, [jobs]);

  useEffect(() => {
    loadJobsForDate(selectedDate);
  }, [selectedDate, loadJobsForDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRevenueFromJob = (job: ScheduledJob) => {
    return job.job_amount || job.due_amount || job.estimated_cost || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">SWC Cleaners</h1>
            <p className="text-white/80 mt-1">
              Operations Dashboard • Route Optimization • Job Management
            </p>
            <p className="text-white/60 text-sm mt-1">
              👥 Team: Yenssi Portillo, Heidi Melgar
            </p>
            {error && (
              <div className="flex items-center mt-2 p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <p className="text-red-400 text-sm">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min="2025-01-01"
              max="2026-12-31"
              className="bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={optimizeRoute}
              disabled={optimizing || jobs.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              {optimizing ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 mr-2" />
              )}
              {optimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { 
              label: 'Jobs Today', 
              value: routeMetrics.jobCount, 
              Icon: Users,
              color: 'text-blue-400'
            },
            { 
              label: 'Revenue', 
              value: `$${routeMetrics.totalRevenue.toFixed(0)}`, 
              Icon: DollarSign,
              color: 'text-green-400'
            },
            { 
              label: 'Work Time', 
              value: `${Math.round(routeMetrics.totalWorkTime / 60)}h`, 
              Icon: Clock,
              color: 'text-purple-400'
            },
            { 
              label: 'Drive Time', 
              value: `${Math.round(routeMetrics.totalDriveTime / 60)}h`, 
              Icon: Navigation,
              color: 'text-orange-400'
            },
            { 
              label: 'Efficiency', 
              value: `${routeMetrics.efficiency.toFixed(1)}%`, 
              Icon: TrendingUp,
              color: routeMetrics.efficiency > 75 ? 'text-green-400' : 'text-yellow-400'
            },
            { 
              label: '$/Hour', 
              value: `$${routeMetrics.avgRevenuePerHour.toFixed(0)}`, 
              Icon: Route,
              color: 'text-cyan-400'
            }
          ].map((metric, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">{metric.label}</p>
                <p className="text-2xl font-semibold">{metric.value}</p>
              </div>
              <metric.Icon className={`h-8 w-8 ${metric.color}`} />
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20">
            <div className="px-6 py-3 font-medium border-b border-white/20 flex justify-between items-center">
              <span>Optimized Route - {formatSelectedDate(selectedDate)}</span>
              {routeMetrics.efficiency > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  routeMetrics.efficiency > 75 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {routeMetrics.efficiency.toFixed(1)}% Efficient
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-white/50" />
                <p className="text-white/70">Loading schedule...</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex justify-between items-center px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-white/60">
                        {job.route_sequence || '—'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-lg">{job.customer_name}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            {job.service}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                            {job.recurrence?.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                          {job.assigned_employees && (
                            <span className="text-green-400" title={`Assigned: ${job.assigned_employees}`}>
                              👥
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mb-1">
                          {cleanAddress(job.address, job.city, job.state)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.scheduled_start ? new Date(job.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'} ({job.estimated_duration || 120}min)
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${getRevenueFromJob(job)}
                          </span>
                          {job.drive_time_from_previous && (
                            <span className="flex items-center">
                              <Navigation className="h-4 w-4 mr-1" />
                              {job.drive_time_from_previous}min drive
                            </span>
                          )}
                          <span className="flex items-center text-cyan-400">
                            <Star className="h-4 w-4 mr-1" />
                            ${Math.round((getRevenueFromJob(job) / ((job.estimated_duration || 120) / 60)))}/hr
                          </span>
                          <span className="flex items-center text-purple-400">
                            <Users className="h-4 w-4 mr-1" />
                            Yenssi & Heidi
                          </span>
                        </div>
                        {job.description && (
                          <p className="text-amber-400 text-xs mt-1">
                            📝 {job.description}
                          </p>
                        )}
                        {job.customer_phone && (
                          <p className="text-green-400 text-xs mt-1">
                            📞 {job.customer_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {job.status === 'pending' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'in_progress')}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm flex items-center transition-colors"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      )}
                      {job.status !== 'completed' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm flex items-center transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => openSmsModal(job)}
                        className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm flex items-center transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        SMS
                      </button>
                      <button
                        onClick={() => openPhotoModal(job)}
                        className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm flex items-center transition-colors"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Photo
                      </button>
                    </div>
                  </div>
                ))}
                
                {jobs.length === 0 && !loading && (
                  <div className="p-8 text-center text-white/70">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-white/30" />
                    <p>No jobs scheduled for this date</p>
                    <p className="text-sm mt-2">Try selecting a weekday to see available jobs</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced SMS Modal */}
      {smsModalOpen && currentJob && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetSmsModal();
              setSmsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold">Send SMS</h3>
                    <p className="text-purple-100 text-sm">Professional messaging</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetSmsModal();
                    setSmsModalOpen(false);
                  }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors border border-white/30 ml-4"
                  title="Close Modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {currentJob.customer_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{currentJob.customer_name}</h4>
                  <p className="text-gray-600 flex items-center text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    {currentJob.customer_phone || '(No phone number)'}
                  </p>
                  <p className="text-xs text-gray-500">{currentJob.address}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Quick Templates */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries({
                    onWay: { icon: '🚐', label: 'On Our Way', desc: 'Team is en route' },
                    arrived: { icon: '🏠', label: "We've Arrived", desc: 'At customer location' },
                    complete: { icon: '✅', label: 'Service Complete', desc: 'Job finished' },
                    feedback: { icon: '⭐', label: 'Request Feedback', desc: 'Ask for review' },
                    reminder: { icon: '📅', label: 'Appointment Reminder', desc: 'Upcoming service' },
                    reschedule: { icon: '🔄', label: 'Reschedule', desc: 'Change appointment' }
                  }).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => handleTemplateSelect(key)}
                      className={`p-2 text-left rounded-lg border-2 transition-all ${
                        selectedTemplate === key 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{template.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{template.label}</p>
                          <p className="text-xs text-gray-500">{template.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Message
                  </label>
                  <span className={`text-xs ${getCharacterColor()}`}>
                    {getCharacterCount()}/160
                  </span>
                </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none text-gray-900 bg-white placeholder-gray-500 text-sm"
                  placeholder="Type your message here..."
                  maxLength={160}
                />
              </div>

              {/* Status Messages */}
              {smsSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">Message Sent!</p>
                      <p className="text-sm text-green-600">
                        {smsDelivered ? 'Delivered successfully' : 'Delivering...'}
                      </p>
                    </div>
                    {!smsDelivered && <Loader2 className="h-4 w-4 animate-spin text-green-500" />}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  resetSmsModal();
                  setSmsModalOpen(false);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition-colors text-sm"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendSMS}
                disabled={!messageText.trim() || sending || smsSent}
                className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : smsSent ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Sent
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-2" />
                    Send SMS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Photo Modal */}
      {photoModalOpen && currentJob && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetPhotoModal();
              setPhotoModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Camera className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold">Photo Documentation</h3>
                    <p className="text-orange-100 text-sm">Capture service evidence</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    resetPhotoModal();
                    setPhotoModalOpen(false);
                  }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors border border-white/30 ml-4"
                  title="Close Modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Job Info */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl">
                  🏠
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{currentJob.customer_name}</h4>
                  <p className="text-gray-600 text-xs">{currentJob.service}</p>
                  <p className="text-xs text-gray-500">{currentJob.address}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Photo Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Photo Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'before', icon: '📸', label: 'Before Photos', desc: 'Initial state' },
                    { id: 'after', icon: '✅', label: 'After Photos', desc: 'Completed work' },
                    { id: 'equipment', icon: '🛠️', label: 'Equipment', desc: 'Tools & supplies' },
                    { id: 'issues', icon: '⚠️', label: 'Issues Found', desc: 'Problems discovered' }
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setPhotoCategory(category.id)}
                      className={`p-3 text-left rounded-xl border-2 transition-all ${
                        photoCategory === category.id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl block mb-1">{category.icon}</span>
                        <p className="font-semibold text-gray-900 text-xs">{category.label}</p>
                        <p className="text-xs text-gray-500">{category.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Photos *
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium text-gray-700 text-sm">Click to select photos</p>
                  <p className="text-xs text-gray-500 mt-1">
                    or drag and drop multiple images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 10MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Selected Photos ({selectedFiles.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                        <FileImage className="h-6 w-6 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-600 text-center truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors text-gray-900 bg-white placeholder-gray-500 text-sm"
                  placeholder="Add any notes about these photos..."
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-800">Uploading photos...</span>
                    <span className="text-xs text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Uploading photos...</span>
                    <span className="text-sm text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex space-x-3 rounded-b-2xl">
              <button
                onClick={() => {
                  resetPhotoModal();
                  setPhotoModalOpen(false);
                }}
                disabled={uploading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoUpload}
                disabled={!photoCategory || selectedFiles.length === 0 || uploading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-2" />
                    Upload Photos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🗺️ Optimized Route Map</h2>
                <p className="text-gray-600 mt-1">
                  SWC Cleaners • {formatSelectedDate(selectedDate)}
                </p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Added this section for job summary and metrics */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 shadow-inner border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Route className="h-5 w-5 mr-2 text-blue-600" />
                  Today's Optimized Route Summary
                </h3>
                {jobs.length > 0 ? (
                  <ul className="list-decimal pl-5 text-gray-700 space-y-2">
                    {jobs.sort((a,b) => (a.route_sequence || 0) - (b.route_sequence || 0)).map((job, index) => (
                      <li key={job.id} className="text-sm">
                        <span className="font-medium">{job.customer_name}</span> at {cleanAddress(job.address, job.city, job.state)}
                        {job.drive_time_from_previous && index > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({job.drive_time_from_previous} min drive from previous)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 text-sm">No jobs available for this route.</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-800">
                  <p className="font-semibold text-sm flex items-center">
                    <Navigation className="h-4 w-4 mr-2 text-orange-600" />
                    Total Estimated Drive Time: <span className="text-blue-700 ml-1"> {Math.round(routeMetrics.totalDriveTime / 60)} hours ({routeMetrics.totalDriveTime} minutes)</span>
                  </p>
                  <p className="font-semibold text-sm flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Total Estimated Work Time: <span className="text-blue-700 ml-1"> {Math.round(routeMetrics.totalWorkTime / 60)} hours ({routeMetrics.totalWorkTime} minutes)</span>
                  </p>
                  <p className="font-semibold text-sm flex items-center mt-1">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Total Estimated Revenue: <span className="text-blue-700 ml-1"> ${routeMetrics.totalRevenue.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              {/* End of new section */}

              <div className="flex space-x-3">
                <a
                  href={generateGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open Full Route in Google Maps
                </a>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}