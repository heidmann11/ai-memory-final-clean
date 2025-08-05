'use client'

import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';

interface ScheduledJob {
  id: number;
  template_id: number;
  customer_name: string;
  address: string;
  city: string;
  scheduled_date: string;
  optimized_start_time?: string;
  estimated_duration: number;
  estimated_cost: number;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  route_sequence?: number;
  drive_time_from_previous?: number;
  has_key: boolean;
  needs_code: boolean;
  special_instructions?: string;
}

interface RouteMetrics {
  totalRevenue: number;
  totalWorkTime: number;
  totalDriveTime: number;
  efficiency: number;
  jobCount: number;
  avgRevenuePerHour: number;
}

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

  const supabase = createClient();

  // Load scheduled jobs for specific date
  const loadJobsForDate = async (date: string) => {
    setLoading(true);
    setError(null);

    try {
      // First, generate jobs for this date
      const { data: generateResult, error: generateError } = await supabase
        .rpc('generate_scheduled_jobs', { target_date: date });

      if (generateError) {
        console.warn('Generate jobs warning:', generateError);
      }

      // Then load the jobs
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('scheduled_date', date)
        .order('route_sequence', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const formattedJobs: ScheduledJob[] = (data || []).map(job => ({
        id: job.id,
        template_id: job.template_id,
        customer_name: job.customer_name,
        address: job.address,
        city: job.city,
        scheduled_date: job.scheduled_date,
        optimized_start_time: job.optimized_start_time,
        estimated_duration: job.estimated_duration,
        estimated_cost: job.estimated_cost,
        priority: job.priority,
        status: job.status,
        route_sequence: job.route_sequence,
        drive_time_from_previous: job.drive_time_from_previous,
        has_key: job.has_key,
        needs_code: job.needs_code,
        special_instructions: job.special_instructions
      }));

      setJobs(formattedJobs);
      calculateMetrics(formattedJobs);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs for selected date');
    } finally {
      setLoading(false);
    }
  };

  // Optimize route using Supabase function
  const optimizeRoute = async () => {
    setOptimizing(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('optimize_daily_route', { target_date: selectedDate });

      if (error) throw error;

      // Reload jobs to get the optimized data
      await loadJobsForDate(selectedDate);
    } catch (err) {
      console.error('Error optimizing route:', err);
      setError('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  // Update job status
  const updateJobStatus = async (jobId: number, newStatus: ScheduledJob['status']) => {
    try {
      const { error } = await supabase
        .from('scheduled_jobs')
        .update({ 
          status: newStatus,
          actual_start_time: newStatus === 'in_progress' ? new Date().toISOString() : undefined,
          actual_end_time: newStatus === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', jobId);

      if (error) throw error;

      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update job status');
    }
  };

  const calculateMetrics = (jobList: ScheduledJob[]) => {
    const totalRevenue = jobList.reduce((sum, job) => sum + job.estimated_cost, 0);
    const totalWorkTime = jobList.reduce((sum, job) => sum + job.estimated_duration, 0);
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
  };

  useEffect(() => {
    loadJobsForDate(selectedDate);
  }, [selectedDate]);

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
      case 'delayed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Route & Retain Operations</h1>
            <p className="text-white/80 mt-1">
              Cleaning service operations and route optimization
            </p>
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30"
            />
            <button
              onClick={optimizeRoute}
              disabled={optimizing || jobs.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center"
            >
              {optimizing ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 mr-2" />
              )}
              {optimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>
            <button
              onClick={() => loadJobsForDate(selectedDate)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-1" /> Refresh
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
              <span>Optimized Route - {new Date(selectedDate).toLocaleDateString()}</span>
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
                    className="flex justify-between items-center px-6 py-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-white/60">
                        {job.route_sequence || '—'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-lg">{job.customer_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          {job.has_key && <Key className="h-4 w-4 text-green-400" title="Has key" />}
                          {job.needs_code && <Shield className="h-4 w-4 text-blue-400" title="Needs code" />}
                        </div>
                        <p className="text-white/70 text-sm mb-1">{job.address}</p>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.optimized_start_time || 'TBD'} ({job.estimated_duration}min)
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${job.estimated_cost}
                          </span>
                          {job.drive_time_from_previous && (
                            <span className="flex items-center">
                              <Navigation className="h-4 w-4 mr-1" />
                              {job.drive_time_from_previous}min drive
                            </span>
                          )}
                          <span className="flex items-center text-cyan-400">
                            <Star className="h-4 w-4 mr-1" />
                            ${Math.round((job.estimated_cost / (job.estimated_duration / 60)))}/hr
                          </span>
                        </div>
                        {job.special_instructions && (
                          <p className="text-amber-400 text-xs mt-1">
                            📝 {job.special_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {job.status === 'scheduled' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'in_progress')}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm flex items-center"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm flex items-center"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </button>
                      )}
                      <button className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        SMS
                      </button>
                      <button className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm flex items-center">
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
                    <p className="text-sm mt-2">Try selecting a weekday to see recurring jobs</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}