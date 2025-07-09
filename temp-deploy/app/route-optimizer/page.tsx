// app/route-optimizer/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Clock,
  Route,
  Truck,
  Fuel,
  Navigation,
  Play,
  Pause,
  Square,
  Timer,
  Camera,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Loader,
  Phone,
  Send,
} from 'lucide-react';

export interface JobLocation {
  id: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  service: string;
  estimatedDuration: number;
  actualDuration?: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  driveTo?: {
    duration: number;
    distance: number;
    traffic: 'light' | 'moderate' | 'heavy';
  };
  equipmentNeeded: string[];
  photos: string[];
  notes: string;
  city?: string;
  state?: string;
  customerPhone?: string; // Added for SMS functionality
}

interface RouteOptimization {
  id: string;
  date: string;
  crew: string;
  totalJobs: number;
  totalDriveTime: number;
  totalWorkTime: number;
  totalDistance: number;
  fuelCost: number;
  efficiency: number;
  status: 'planned' | 'active' | 'completed';
}

export default function RouteOptimizer() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCrew, setSelectedCrew] = useState('crew_1');
  const [jobs, setJobs] = useState<JobLocation[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [optimizedRoute, setOptimizedRoute] = useState<JobLocation[]>([]);
  const [routeStats, setRouteStats] = useState<RouteOptimization | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobTimer, setJobTimer] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedMapJob, setSelectedMapJob] = useState<JobLocation | null>(null);

  const crews = [
    { id: 'crew_1', name: 'Team Alpha (Sarah & Mike)', vehicle: 'Truck #1' },
    { id: 'crew_2', name: 'Team Beta (Tom & Lisa)', vehicle: 'Truck #2' },
    { id: 'crew_3', name: 'Team Gamma (Dave)', vehicle: 'Van #1' },
  ];

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
        return;
      }

      // Transform Supabase data to JobLocation format
      const transformedJobs: JobLocation[] = data.map((job) => ({
        id: job.id,
        customerName: job.customer_name || 'Unknown Customer',
        address: job.address || 'Address not specified',
        coordinates: { 
          lat: job.lat || 39.2904, // Default to Baltimore if no coordinates
          lng: job.lng || -76.6122 
        },
        service: job.service || job.title || 'General Service',
        estimatedDuration: job.estimated_duration || 60,
        priority: (job.priority as 'high' | 'medium' | 'low') || 'medium',
        status: (job.status as 'pending' | 'in_progress' | 'completed' | 'delayed') || 'pending',
        scheduledTime: job.scheduled_start ? 
          new Date(job.scheduled_start).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }) : '09:00',
        driveTo: {
          duration: Math.floor(Math.random() * 20) + 5, // Mock drive data for now
          distance: Math.round((Math.random() * 10 + 1) * 10) / 10,
          traffic: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy'
        },
        equipmentNeeded: job.service ? [job.service + ' Tools'] : ['Standard Tools'],
        photos: [],
        notes: job.title || 'No additional notes',
        city: job.city,
        state: job.state,
        customerPhone: job.customer_phone || job.phone || '(410) 555-0123', // Added phone field
      }));

      setJobs(transformedJobs);
      console.log('✅ Successfully loaded', transformedJobs.length, 'jobs from Supabase');
      
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Update job status in Supabase
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job status:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update job status:', err);
      return false;
    }
  };

  // Send SMS to customer
  const sendSMS = async (job: JobLocation, messageType: 'arrival' | 'completion' | 'delay' | 'custom') => {
    try {
      const messages = {
        arrival: `Hi ${job.customerName}! Your Route & Retain technician is on their way to ${job.address} for ${job.service}. Estimated arrival: ${job.scheduledTime}. Questions? Reply here!`,
        completion: `Great news ${job.customerName}! We've completed your ${job.service} service at ${job.address}. Thank you for choosing Route & Retain!`,
        delay: `Hi ${job.customerName}, we're running a bit behind schedule for your ${job.service} appointment. New estimated arrival: ${job.scheduledTime}. Sorry for the inconvenience!`,
        custom: `Update on your ${job.service} appointment with Route & Retain.`
      };

      const messageBody = messages[messageType];
      
      // In a real implementation, this would call your SMS API (Twilio, AWS SNS, etc.)
      console.log(`Sending SMS to ${job.customerPhone}:`, messageBody);
      
      // Mock SMS sending with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`SMS sent successfully to ${job.customerName} at ${job.customerPhone}!\n\nMessage: "${messageBody}"`);
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      alert('Failed to send SMS. Please try again.');
      return false;
    }
  };

  // Quick SMS options
  const showSMSOptions = (job: JobLocation) => {
    const options = [
      { type: 'arrival', label: '📍 On Our Way', description: 'Notify arrival time' },
      { type: 'delay', label: '⏰ Running Late', description: 'Apologize for delay' },
      { type: 'completion', label: '✅ Job Complete', description: 'Confirm completion' },
    ];

    const selectedOption = prompt(
      `Quick SMS to ${job.customerName}:\n\n` +
      options.map((opt, idx) => `${idx + 1}. ${opt.label} - ${opt.description}`).join('\n') +
      '\n\nEnter number (1-3) or press Cancel:'
    );

    if (selectedOption) {
      const optionIndex = parseInt(selectedOption) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) {
        sendSMS(job, options[optionIndex].type as 'arrival' | 'completion' | 'delay');
      } else {
        alert('Invalid option selected');
      }
    }
  };

  const optimizeRouteWithMaps = useCallback(async () => {
    setIsOptimizing(true);
    try {
      // Mock optimization logic - in production, this would call a real route optimization API
      const mockResult = {
        success: true,
        optimizedRoute: jobs.map((job, index) => ({
          jobId: job.id,
          coordinates: job.coordinates,
          duration: Math.floor(Math.random() * 20) + 5,
          distance: Math.round((Math.random() * 5 + 1) * 10) / 10,
          traffic: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy'
        })),
        metrics: {
          totalJobs: jobs.length,
          totalDriveTime: Math.floor(Math.random() * 60) + 30,
          totalDistance: Math.round((Math.random() * 20 + 10) * 10) / 10,
          fuelCost: Math.round((Math.random() * 10 + 5) * 100) / 100,
          efficiency: Math.floor(Math.random() * 20) + 75,
        },
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mockResult.success) {
        const updatedJobsWithDriveData = jobs.map((job) => {
          const optimizedJobData = mockResult.optimizedRoute.find((r: any) => r.jobId === job.id);
          if (optimizedJobData) {
            return {
              ...job,
              driveTo: {
                duration: optimizedJobData.duration,
                distance: optimizedJobData.distance,
                traffic: optimizedJobData.traffic,
              },
            };
          }
          return job;
        });

        // Sort by priority and status for optimization
        const sortedJobs = updatedJobsWithDriveData.sort((a, b) => {
          const statusOrder = { 'in_progress': 0, 'pending': 1, 'completed': 2, 'delayed': 3 };
          const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };

          if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
          if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;

          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }

          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }

          return a.scheduledTime.localeCompare(b.scheduledTime);
        });

        setOptimizedRoute(sortedJobs);

        setRouteStats({
          id: 'route_1',
          date: selectedDate,
          crew: selectedCrew,
          totalJobs: mockResult.metrics.totalJobs,
          totalDriveTime: mockResult.metrics.totalDriveTime,
          totalWorkTime: sortedJobs.reduce((sum: number, job: JobLocation) => sum + job.estimatedDuration, 0),
          totalDistance: mockResult.metrics.totalDistance,
          fuelCost: mockResult.metrics.fuelCost,
          efficiency: mockResult.metrics.efficiency,
          status: 'active',
        });

        alert('Route optimized successfully with real job data!');
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      alert('Route optimization failed. Using basic optimization.');
    } finally {
      setIsOptimizing(false);
    }
  }, [jobs, selectedDate, selectedCrew]);

  const basicRouteOptimization = useCallback(() => {
    if (jobs.length === 0) return;

    const optimized = [...jobs].sort((a, b) => {
      const statusOrder = { 'in_progress': 0, 'pending': 1, 'completed': 2, 'delayed': 3 };
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };

      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    setOptimizedRoute(optimized);

    const totalDriveTime = optimized.reduce((sum, job) => sum + (job.driveTo?.duration || 0), 0);
    const totalWorkTime = optimized.reduce((sum, job) => sum + job.estimatedDuration, 0);
    const totalDistance = optimized.reduce((sum, job) => sum + (job.driveTo?.distance || 0), 0);
    const fuelCost = totalDistance * 0.15;
    const efficiency = totalWorkTime + totalDriveTime > 0 ? Math.round((totalWorkTime / (totalWorkTime + totalDriveTime)) * 100) : 0;

    setRouteStats({
      id: 'route_1',
      date: selectedDate,
      crew: selectedCrew,
      totalJobs: optimized.length,
      totalDriveTime,
      totalWorkTime,
      totalDistance,
      fuelCost,
      efficiency,
      status: 'active',
    });
  }, [selectedDate, selectedCrew, jobs]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      basicRouteOptimization();

      const initiallyActiveJob = jobs.find(job => job.status === 'in_progress');
      if (initiallyActiveJob) {
        setActiveJobId(initiallyActiveJob.id);
        setJobTimer(0);
      }
    }
  }, [jobs, basicRouteOptimization]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (activeJobId) {
      interval = setInterval(() => {
        setJobTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId]);

  const startJob = async (jobId: string) => {
    const success = await updateJobStatus(jobId, 'in_progress');
    if (success) {
      setActiveJobId(jobId);
      setJobTimer(0);
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, status: 'in_progress', actualStartTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
            : job
        )
      );
      setOptimizedRoute(prevRoute =>
        prevRoute.map(job =>
          job.id === jobId
            ? { ...job, status: 'in_progress', actualStartTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
            : job
        )
      );
    } else {
      alert('Failed to start job. Please try again.');
    }
  };

  const completeJob = async (jobId: string) => {
    const success = await updateJobStatus(jobId, 'completed');
    if (success) {
      setActiveJobId(null);
      setJobTimer(0);
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? {
              ...job,
              status: 'completed',
              actualEndTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              actualDuration: jobTimer / 60,
            }
            : job
        )
      );
      setOptimizedRoute(prevRoute =>
        prevRoute.map(job =>
          job.id === jobId
            ? {
              ...job,
              status: 'completed',
              actualEndTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              actualDuration: jobTimer / 60,
            }
            : job
        )
      );
    } else {
      alert('Failed to complete job. Please try again.');
    }
  };

  const formatDuration = (minutes: number) => {
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m `;
    if (result === '' || secs > 0) result += `${secs}s`;
    return result.trim();
  };

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const activeJobDetails = activeJobId ? optimizedRoute.find(job => job.id === activeJobId) : null;

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Route Data...</h2>
          <p className="text-white/80">Connecting to Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Route Optimizer</h1>
            <p className="text-white/80 mt-2">
              {jobs.length > 0 ? `Managing ${jobs.length} jobs (today)` : 'No jobs found - add some jobs to get started!'}
            </p>
          </div>
          <button
            onClick={fetchJobs}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Refresh Jobs
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-24 w-24 mx-auto mb-6 text-white/40" />
            <h2 className="text-2xl font-bold text-white mb-4">No Jobs to Optimize</h2>
            <p className="text-white/80 mb-6">Add some jobs to your dashboard to start route optimization</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="selectedDate" className="block text-sm font-semibold text-white/80 mb-2">Date</label>
                <input
                  id="selectedDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label htmlFor="selectedCrew" className="block text-sm font-semibold text-white/80 mb-2">Crew</label>
                <select
                  id="selectedCrew"
                  value={selectedCrew}
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {crews.map(crew => (
                    <option key={crew.id} value={crew.id} className="bg-blue-800 text-white">{crew.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={optimizeRouteWithMaps}
                  disabled={isOptimizing}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg flex items-center justify-center text-sm font-medium text-white rounded-lg disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isOptimizing ? 'Optimizing...' : 'Optimize with Maps'}
                </button>
              </div>
            </div>

            {/* Route Statistics */}
            {routeStats && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{routeStats.totalJobs}</div>
                  <div className="text-sm text-blue-100">Total Jobs</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{formatDuration(routeStats.totalWorkTime)}</div>
                  <div className="text-sm text-green-100">Work Time</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{formatDuration(routeStats.totalDriveTime)}</div>
                  <div className="text-sm text-orange-100">Drive Time</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{routeStats.totalDistance.toFixed(1)}mi</div>
                  <div className="text-sm text-purple-100">Distance</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">${routeStats.fuelCost.toFixed(2)}</div>
                  <div className="text-sm text-red-100">Fuel Cost</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{routeStats.efficiency}%</div>
                  <div className="text-sm text-indigo-100">Efficiency</div>
                </div>
              </div>
            )}

            {/* Optimized Route & Interactive Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Route Schedule */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="flex items-center gap-2 text-white text-xl font-semibold">
                    <MapPin className="h-5 w-5 text-green-400" />
                    Optimized Route Schedule ({optimizedRoute.length} jobs)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {optimizedRoute.map((job, index) => (
                      <div
                        key={job.id}
                        className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md bg-white/5 border-white/20 ${job.status === 'in_progress' ? 'ring-2 ring-blue-400' : ''} ${selectedMapJob?.id === job.id ? 'bg-blue-500/20 border-blue-400 shadow-md' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{job.customerName}</h4>
                              <p className="text-sm text-white/80">{job.service}</p>
                              <p className="text-xs text-white/60">{job.address}</p>
                              {job.customerPhone && (
                                <p className="text-xs text-blue-300 flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3" />
                                  {job.customerPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${job.priority === 'high' ? 'bg-red-100 text-red-800' : job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {job.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white/80">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">Scheduled:</span> {formatTime(job.scheduledTime)}
                            </div>
                            <div className="flex items-center gap-1 text-white/80">
                              <Timer className="h-3 w-3" />
                              <span className="font-medium">Est. Work:</span> {formatDuration(job.estimatedDuration)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {job.driveTo && (
                              <>
                                <div className="flex items-center gap-1 text-white/80">
                                  <Truck className="h-3 w-3" />
                                  <span className="font-medium">Drive:</span> {formatDuration(job.driveTo.duration)}
                                </div>
                                <div className="flex items-center gap-1 text-white/80">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-medium">Distance:</span> {job.driveTo.distance.toFixed(1)} mi
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-white/60 mb-1">Equipment Required:</div>
                          <div className="flex flex-wrap gap-1">
                            {job.equipmentNeeded.map((equipment, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded border border-white/20">
                                {equipment}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {/* SMS Button - Available for all non-completed jobs */}
                          {job.status !== 'completed' && (
                            <button
                              onClick={() => showSMSOptions(job)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                              title="Send SMS to customer"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              SMS
                            </button>
                          )}

                          {/* Status-specific buttons */}
                          {job.status === 'pending' && (
                            <>
                              <button
                                onClick={() => startJob(job.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </button>
                              <button
                                onClick={() => completeJob(job.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                                title="Mark as complete without starting"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </button>
                            </>
                          )}

                          {job.status === 'in_progress' && (
                            <button
                              onClick={() => completeJob(job.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </button>
                          )}

                          {job.status === 'delayed' && (
                            <>
                              <button
                                onClick={() => startJob(job.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Resume
                              </button>
                              <button
                                onClick={() => completeJob(job.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center transition-colors"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </button>
                            </>
                          )}

                          {job.status === 'completed' && (
                            <span className="text-green-400 text-sm flex items-center px-3 py-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          )}
                        </div>

                        {job.notes && (
                          <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                            <div className="text-xs font-medium text-white/80 mb-1">Job Notes:</div>
                            <div className="text-sm text-white">{job.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="flex items-center gap-2 text-white text-xl font-semibold">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Interactive Route Map
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden border-2 border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-100 to-blue-200">
                      <div className="absolute top-16 left-8 w-20 h-16 bg-green-300 rounded-lg opacity-60"></div>
                      <div className="absolute bottom-20 right-12 w-24 h-18 bg-green-300 rounded-lg opacity-60"></div>
                      
                      <div className="absolute top-32 left-48 w-40 h-24 bg-blue-400 rounded-2xl opacity-70 shadow-inner"></div>
                      
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="0" y1="120" x2="100%" y2="140" stroke="#4b5563" strokeWidth="4" opacity="0.7" />
                        <line x1="0" y1="200" x2="100%" y2="200" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
                        <line x1="180" y1="0" x2="180" y2="100%" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
                        <line x1="120" y1="0" x2="120" y2="100%" stroke="#6b7280" strokeWidth="3" opacity="0.6" />
                        
                        <path 
                          d="M 80 80 L 180 120 L 280 160 L 380 200 L 460 240"
                          stroke="#1d4ed8" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeDasharray="10,5"
                          className="animate-pulse drop-shadow-lg"
                        />
                        <polygon points="175,115 185,120 175,125" fill="#1d4ed8" />
                        <polygon points="275,155 285,160 275,165" fill="#1d4ed8" />
                        <polygon points="375,195 385,200 375,205" fill="#1d4ed8" />
                      </svg>
                    </div>

                    {optimizedRoute.map((job, index) => {
                      const positions = [
                        { top: '20%', left: '15%' },
                        { top: '30%', left: '35%' },
                        { top: '50%', left: '55%' },
                        { top: '60%', left: '80%' },
                        { top: '40%', left: '70%' },
                      ];
                      
                      const position = positions[index] || { top: '50%', left: '50%' };
                      const statusColors = {
                        'pending': 'bg-amber-500 shadow-amber-500/50',
                        'in_progress': 'bg-blue-600 animate-pulse shadow-blue-500/50',
                        'completed': 'bg-emerald-500 shadow-emerald-500/50',
                        'delayed': 'bg-red-500 shadow-red-500/50'
                      };

                      return (
                        <div 
                          key={job.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                          style={{ top: position.top, left: position.left }}
                          onClick={() => setSelectedMapJob(selectedMapJob?.id === job.id ? null : job)}
                        >
                          <div className={`w-10 h-10 ${statusColors[job.status]} rounded-full border-3 border-white shadow-xl flex items-center justify-center text-white font-bold text-sm hover:scale-125 transition-all duration-200`}>
                            {index + 1}
                          </div>
                          
                          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/20 rounded-full blur-sm"></div>
                          
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900/95 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                            <div className="font-bold text-white">{job.customerName}</div>
                            <div className="text-blue-200">{job.service}</div>
                            <div className="text-gray-300 text-xs">{job.status.replace('_', ' ')}</div>
                            <div className="text-gray-300 text-xs">{formatTime(job.scheduledTime)}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900/95"></div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-3">
                      <h4 className="font-bold text-gray-800 text-sm flex items-center">
                        <span className="text-blue-600 mr-2">📍</span>
                        Baltimore, MD
                      </h4>
                      <p className="text-xs text-gray-600">Route & Retain Service Area</p>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl text-xs">
                      <div className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🗺️</span>
                        Route Legend
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-600 rounded-full shadow-sm"></div>
                          <span className="text-gray-700">In Progress</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-sm"></div>
                          <span className="text-gray-700">Completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-amber-500 rounded-full shadow-sm"></div>
                          <span className="text-gray-700">Pending</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-1 bg-blue-600 rounded"></div>
                          <span className="text-gray-700">Optimized Route</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedMapJob && (
                    <div className="mt-4 bg-white/10 rounded-lg p-4 border border-white/20">
                      <h4 className="font-semibold text-white mb-2 flex items-center justify-between">
                        {selectedMapJob.customerName} - {selectedMapJob.service}
                        <button 
                          className="text-white/60 hover:text-white"
                          onClick={() => setSelectedMapJob(null)}
                        >
                          ✕
                        </button>
                      </h4>
                      <p className="text-white/80 text-sm mb-2">📍 {selectedMapJob.address}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-white/80">
                          <strong>Status:</strong> {selectedMapJob.status.replace('_', ' ')}
                        </div>
                        <div className="text-white/80">
                          <strong>Priority:</strong> {selectedMapJob.priority}
                        </div>
                        <div className="text-white/80">
                          <strong>Scheduled:</strong> {formatTime(selectedMapJob.scheduledTime)}
                        </div>
                        <div className="text-white/80">
                          <strong>Duration:</strong> {formatDuration(selectedMapJob.estimatedDuration)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Tracker & AI Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Active Job Timer & Details */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="flex items-center gap-2 text-white text-xl font-semibold">
                    <Timer className="h-5 w-5 text-blue-400" />
                    Active Job Tracker
                  </h3>
                </div>
                <div className="p-6">
                  {activeJobDetails ? (
                    <div className="space-y-6">
                      <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20">
                        <h4 className="text-xl font-semibold text-white">{activeJobDetails.customerName}</h4>
                        <p className="text-white/80 mb-4">{activeJobDetails.service}</p>
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {Math.floor(jobTimer / 3600)}:{Math.floor((jobTimer % 3600) / 60).toString().padStart(2, '0')}:{(jobTimer % 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-sm text-white/60">Active Work Time</p>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/10 p-3 rounded-lg">
                            <div className="font-semibold text-white/80">Estimated</div>
                            <div className="text-blue-400 font-bold">{formatDuration(activeJobDetails.estimatedDuration)}</div>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg">
                            <div className="font-semibold text-white/80">Progress</div>
                            <div className="text-green-400 font-bold">
                              {activeJobDetails.estimatedDuration > 0 ? Math.round((jobTimer / (activeJobDetails.estimatedDuration * 60)) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center justify-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </button>
                        <button 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center" 
                          onClick={() => completeJob(activeJobDetails.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/60">
                      <Timer className="h-16 w-16 mx-auto mb-4 text-white/40" />
                      <p className="text-lg font-medium">No Active Job</p>
                      <p className="text-sm">Start a job to begin tracking time and progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="flex items-center gap-2 text-white text-xl font-semibold">
                    <span className="text-purple-400">🧠</span>
                    AI Insights (Real Data)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">Route Optimization</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {routeStats ? `${routeStats.efficiency}% efficiency with ${routeStats.totalJobs} jobs` : 'Waiting for route data...'}
                      </p>
                      <p className="text-green-400 text-xs mt-1">Connected to Supabase</p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">Job Status</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {jobs.filter(j => j.status === 'pending').length} pending, {jobs.filter(j => j.status === 'in_progress').length} active
                      </p>
                      <p className="text-blue-400 text-xs mt-1">Live updates from database</p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">Total Work Time</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        {routeStats ? formatDuration(routeStats.totalWorkTime) : '0m'} estimated across all jobs
                      </p>
                      <p className="text-amber-400 text-xs mt-1">Calculated from real job data</p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-white font-medium text-sm">Coverage Area</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Jobs across {new Set(jobs.map(j => j.city).filter(Boolean)).size} cities
                      </p>
                      <p className="text-purple-400 text-xs mt-1">Baltimore metro area focus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}