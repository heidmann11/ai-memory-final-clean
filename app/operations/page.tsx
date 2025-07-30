// app/operations/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Clock,
  Route,
  Truck,
  Navigation,
  Play,
  CheckCircle2,
  Timer,
  Camera,
  MessageSquare,
  Phone,
  Send,
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Upload,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Brain,
  Zap,
  Activity,
  BarChart3,
  FileImage,
  Settings,
  RefreshCw
} from 'lucide-react';

// Types
interface Job {
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
  customerPhone?: string;
  company: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  recommendation: string;
  alerts: string[];
}

interface AIInsight {
  type: 'optimization' | 'efficiency' | 'weather' | 'customer' | 'financial';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export default function OperationsDashboard() {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobTimer, setJobTimer] = useState<number>(0);
  const [selectedIndustry, setSelectedIndustry] = useState('cleaning');
  const [selectedCrew, setSelectedCrew] = useState('crew_1');
  const [loading, setLoading] = useState(true);
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [weather, setWeather] = useState<WeatherData>({
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    recommendation: 'Excellent for outdoor work',
    alerts: []
  });
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);

  // Configuration
  const industries = [
    { id: 'cleaning', name: '🧽 Cleaning', table: 'jobs', theme: 'blue' },
    { id: 'landscaping', name: '🌱 Landscaping', table: 'service_jobs', theme: 'green' },
    { id: 'electrical', name: '⚡ Electrical', table: 'service_jobs', theme: 'yellow' },
    { id: 'plumbing', name: '🔧 Plumbing', table: 'service_jobs', theme: 'cyan' }
  ];

  const crews = [
    { id: 'crew_1', name: 'Team Alpha', members: ['Sarah', 'Mike'], vehicle: 'Truck #1' },
    { id: 'crew_2', name: 'Team Beta', members: ['Tom', 'Lisa'], vehicle: 'Truck #2' },
    { id: 'crew_3', name: 'Team Gamma', members: ['Dave'], vehicle: 'Van #1' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'jobs', name: 'Jobs', icon: MapPin },
    { id: 'routes', name: 'Routes', icon: Route },
    { id: 'communications', name: 'SMS', icon: MessageSquare },
    { id: 'photos', name: 'Photos', icon: Camera },
    { id: 'insights', name: 'AI Insights', icon: Brain }
  ];

  // Fetch Jobs from Supabase (DEBUG VERSION)
  const fetchJobs = useCallback(async () => {
    console.log('🔍 Starting fetchJobs...');
    console.log('📋 Selected Industry:', selectedIndustry);
    
    setLoading(true);
    try {
      const supabase = createClient();
      console.log('✅ Supabase client created');
      
      const currentIndustry = industries.find(ind => ind.id === selectedIndustry);
      console.log('🏭 Current Industry Config:', currentIndustry);
      
      const tableName = currentIndustry?.table || 'jobs';
      console.log('📊 Table Name:', tableName);
      
      let query = supabase.from(tableName).select('*');
      console.log('🔍 Base Query Created for table:', tableName);
      
      if (tableName === 'service_jobs') {
        console.log('⚙️ Adding service_jobs filters...');
        query = query.eq('industry', selectedIndustry).eq('status', 'active');
      } else {
        console.log('📝 Using jobs table (no additional filters)');
      }
      
      console.log('🚀 Executing query...');
      const { data, error } = await query.order('id', { ascending: false });

      console.log('📥 Query Response:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      console.log('  - Data Length:', data?.length || 0);

      if (error) {
        console.error('❌ Supabase Error:', error);
        console.error('❌ Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setJobs([]);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from query');
        setJobs([]);
        optimizeRoute([]);
        generateAIInsights([]);
        return;
      }

      console.log('🔄 Starting data transformation...');
      console.log('📋 Raw data sample:', data[0]);

      const transformedJobs: Job[] = data.map((job, index) => {
        console.log(`🔄 Transforming job ${index + 1}:`, job);
        
        if (tableName === 'service_jobs') {
          console.log('🌱 Using service_jobs transformation');
          return {
            id: job.id.toString(),
            customerName: job.customer_name || 'Unknown Customer',
            address: job.address || 'Address not specified',
            coordinates: { 
              lat: job.lat || 39.2904,
              lng: job.lng || -76.6122 
            },
            service: job.service_type || 'General Service',
            estimatedDuration: job.estimated_duration || 60,
            priority: job.priority === 1 ? 'high' : job.priority === 3 ? 'low' : 'medium',
            status: 'pending',
            scheduledTime: '09:00',
            driveTo: {
              duration: Math.floor(Math.random() * 20) + 5,
              distance: Math.round((Math.random() * 10 + 1) * 10) / 10,
              traffic: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy'
            },
            equipmentNeeded: job.equipment_required || ['Standard Tools'],
            photos: [],
            notes: job.special_instructions || 'No additional notes',
            city: job.city,
            state: job.state,
            customerPhone: job.customer_phone || '(410) 555-0123',
            company: selectedIndustry
          };
        } else {
          console.log('🧽 Using jobs transformation');
          const transformed = {
            id: job.id,
            customerName: job.customer_name || 'Unknown Customer',
            address: job.address || 'Address not specified',
            coordinates: { 
              lat: job.lat || 39.2904,
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
              duration: Math.floor(Math.random() * 20) + 5,
              distance: Math.round((Math.random() * 10 + 1) * 10) / 10,
              traffic: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy'
            },
            equipmentNeeded: job.service ? [job.service + ' Tools'] : ['Standard Tools'],
            photos: [],
            notes: job.title || 'No additional notes',
            city: job.city,
            state: job.state,
            customerPhone: job.customer_phone || job.phone || '(410) 555-0123',
            company: selectedIndustry
          };
          console.log('🔄 Transformed job:', transformed);
          return transformed;
        }
      });

      console.log('✅ Transformation complete!');
      console.log('📊 Final transformed jobs:', transformedJobs);
      console.log('📈 Total jobs transformed:', transformedJobs.length);

      setJobs(transformedJobs);
      optimizeRoute(transformedJobs);
      generateAIInsights(transformedJobs);
      
      console.log('🎉 fetchJobs completed successfully!');
    } catch (err) {
      console.error('💥 Unexpected error in fetchJobs:', err);
      console.error('💥 Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setJobs([]);
    } finally {
      setLoading(false);
      console.log('🏁 fetchJobs finished (loading set to false)');
    }
  }, [selectedIndustry]);

  // Generate AI Insights
  const generateAIInsights = (jobData: Job[]) => {
    const insights: AIInsight[] = [];

    // Route optimization insights
    const totalDriveTime = jobData.reduce((sum, job) => sum + (job.driveTo?.duration || 0), 0);
    const totalWorkTime = jobData.reduce((sum, job) => sum + job.estimatedDuration, 0);
    const efficiency = totalWorkTime / (totalWorkTime + totalDriveTime) * 100;

    if (efficiency < 70) {
      insights.push({
        type: 'optimization',
        title: 'Route Optimization Opportunity',
        description: `Current route efficiency is ${efficiency.toFixed(1)}%. Reorganizing stops could save ${Math.round((totalDriveTime * 0.2) / 60)} hours.`,
        action: 'Optimize Route',
        priority: 'high',
        impact: 'Time savings, fuel reduction'
      });
    }

    // Weather impact insights
    if (weather.windSpeed > 15) {
      insights.push({
        type: 'weather',
        title: 'High Wind Advisory',
        description: `Wind speeds of ${weather.windSpeed} mph may affect outdoor work. Consider rescheduling exterior jobs.`,
        priority: 'medium',
        impact: 'Safety, job quality'
      });
    }

    // Customer communication insights
    const urgentJobs = jobData.filter(job => job.priority === 'high' && job.status === 'pending');
    if (urgentJobs.length > 0) {
      insights.push({
        type: 'customer',
        title: 'Urgent Jobs Require Communication',
        description: `${urgentJobs.length} high-priority jobs pending. Send arrival notifications to maintain customer satisfaction.`,
        action: 'Send SMS Updates',
        priority: 'high',
        impact: 'Customer satisfaction'
      });
    }

    // Efficiency insights
    const avgJobDuration = jobData.reduce((sum, job) => sum + job.estimatedDuration, 0) / jobData.length;
    if (avgJobDuration > 90) {
      insights.push({
        type: 'efficiency',
        title: 'Long Job Duration Detected',
        description: `Average job time is ${avgJobDuration.toFixed(0)} minutes. Consider equipment upgrades or process optimization.`,
        priority: 'medium',
        impact: 'Productivity increase'
      });
    }

    setAiInsights(insights);
  };

  // Route optimization
  const optimizeRoute = (jobData: Job[]) => {
    const optimized = [...jobData].sort((a, b) => {
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
  };

  // Job management functions
  const startJob = async (jobId: string) => {
    setActiveJobId(jobId);
    setJobTimer(0);
    
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, status: 'in_progress', actualStartTime: new Date().toLocaleTimeString() }
          : job
      )
    );
    
    setOptimizedRoute(prevRoute =>
      prevRoute.map(job =>
        job.id === jobId
          ? { ...job, status: 'in_progress', actualStartTime: new Date().toLocaleTimeString() }
          : job
      )
    );
  };

  const completeJob = async (jobId: string) => {
    setActiveJobId(null);
    setJobTimer(0);
    
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'completed',
              actualEndTime: new Date().toLocaleTimeString(),
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
              actualEndTime: new Date().toLocaleTimeString(),
              actualDuration: jobTimer / 60,
            }
          : job
      )
    );
  };

  // SMS Functions
  const sendSMS = async (job?: Job, messageType?: 'arrival' | 'completion' | 'delay') => {
    let message = smsMessage;
    let recipient = smsRecipient;

    if (job && messageType) {
      recipient = job.customerName;
      const messages = {
        arrival: `Hi ${job.customerName}! Your technician is on their way for ${job.service}. ETA: ${job.scheduledTime}`,
        completion: `Great news! We've completed your ${job.service} service. Thank you for choosing us!`,
        delay: `Hi ${job.customerName}, we're running slightly behind schedule. New ETA: ${job.scheduledTime}. Sorry for any inconvenience.`
      };
      message = messages[messageType];
    }

    alert(`SMS sent to ${recipient}: "${message}"`);
    setSmsMessage('');
    setSmsRecipient('');
  };

  // Effects
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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

  // Utility functions
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'delayed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentIndustry = industries.find(ind => ind.id === selectedIndustry);
  const currentCrew = crews.find(crew => crew.id === selectedCrew);
  const activeJob = activeJobId ? optimizedRoute.find(job => job.id === activeJobId) : null;

  // Calculate stats
  const stats = {
    totalJobs: jobs.length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    activeJobs: jobs.filter(j => j.status === 'in_progress').length,
    pendingJobs: jobs.filter(j => j.status === 'pending').length,
    totalWorkTime: jobs.reduce((sum, job) => sum + job.estimatedDuration, 0),
    totalDriveTime: jobs.reduce((sum, job) => sum + (job.driveTo?.duration || 0), 0),
    efficiency: jobs.length > 0 ? Math.round((jobs.reduce((sum, job) => sum + job.estimatedDuration, 0) / (jobs.reduce((sum, job) => sum + job.estimatedDuration, 0) + jobs.reduce((sum, job) => sum + (job.driveTo?.duration || 0), 0))) * 100) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading Operations...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Zap className="h-10 w-10 text-yellow-400" />
              Operations Command Center
            </h1>
            <p className="text-white/80 mt-2">AI-powered operations management for {currentIndustry?.name} services</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {industries.map(industry => (
                <option key={industry.id} value={industry.id} className="bg-gray-800 text-white">
                  {industry.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              className="px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {crews.map(crew => (
                <option key={crew.id} value={crew.id} className="bg-gray-800 text-white">
                  {crew.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={fetchJobs}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <div className="text-sm text-blue-100">Total Jobs</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <div className="text-sm text-green-100">Completed</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <div className="text-sm text-orange-100">Active</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <div className="text-sm text-purple-100">Pending</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{stats.efficiency}%</div>
            <div className="text-sm text-cyan-100">Efficiency</div>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg p-4 text-center shadow-lg">
            <div className="text-2xl font-bold">{weather.temp}°F</div>
            <div className="text-sm text-pink-100">Weather</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white border-b-2 border-blue-400'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Job Monitor */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Timer className="h-5 w-5 text-blue-400" />
                    Active Job Monitor
                  </h3>
                </div>
                <div className="p-6">
                  {activeJob ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20">
                        <h4 className="text-xl font-semibold text-white">{activeJob.customerName}</h4>
                        <p className="text-white/80 mb-4">{activeJob.service}</p>
                        <div className="text-4xl font-bold text-blue-400 mb-2">
                          {formatDuration(jobTimer)}
                        </div>
                        <p className="text-sm text-white/60">Active Work Time</p>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/10 p-3 rounded-lg">
                            <div className="font-semibold text-white/80">Estimated</div>
                            <div className="text-blue-400 font-bold">{Math.round(activeJob.estimatedDuration / 60)}h {activeJob.estimatedDuration % 60}m</div>
                          </div>
                          <div className="bg-white/10 p-3 rounded-lg">
                            <div className="font-semibold text-white/80">Progress</div>
                            <div className="text-green-400 font-bold">
                              {Math.round((jobTimer / (activeJob.estimatedDuration * 60)) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => sendSMS(activeJob, 'completion')}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center justify-center"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Notify Customer
                        </button>
                        <button 
                          onClick={() => completeJob(activeJob.id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
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
                      <p className="text-sm">Start a job to begin tracking</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather & Conditions */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CloudSun className="h-5 w-5 text-yellow-400" />
                    Weather Conditions
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <CloudSun className="h-12 w-12 text-yellow-400" />
                      <div>
                        <h4 className="text-3xl font-bold text-white">{weather.temp}°F</h4>
                        <p className="text-white/80">{weather.condition}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <Droplets className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-white text-lg font-semibold">{weather.humidity}%</p>
                      <p className="text-white/60 text-xs">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-white text-lg font-semibold">{weather.windSpeed} mph</p>
                      <p className="text-white/60 text-xs">Wind</p>
                    </div>
                    <div className="text-center">
                      <Thermometer className="h-6 w-6 text-red-400 mx-auto mb-1" />
                      <p className="text-white text-lg font-semibold">{weather.visibility} mi</p>
                      <p className="text-white/60 text-xs">Visibility</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg text-center ${weather.recommendation.includes('Excellent') || weather.recommendation.includes('Perfect') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    <p className="font-medium">{weather.recommendation}</p>
                  </div>
                  
                  {weather.alerts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {weather.alerts.map((alert, index) => (
                        <div key={index} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {alert}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job List */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    {currentIndustry?.name} Jobs ({jobs.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <div key={job.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white">{job.customerName}</h4>
                              <p className="text-sm text-white/80">{job.service}</p>
                              <p className="text-xs text-white/60 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.address}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                                {job.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                {job.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 text-sm text-white/80 mb-3">
                            <span>🕒 {Math.round(job.estimatedDuration / 60)}h {job.estimatedDuration % 60}m</span>
                            {job.driveTo && <span>🚗 {job.driveTo.distance}mi</span>}
                          </div>
                          
                          <div className="flex gap-2">
                            {job.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => startJob(job.id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </button>
                                <button
                                  onClick={() => sendSMS(job, 'arrival')}
                                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm flex items-center"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  SMS
                                </button>
                              </>
                            )}
                            
                            {job.status === 'in_progress' && (
                              <button
                                onClick={() => completeJob(job.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-white/60">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-white/40" />
                        <p className="text-lg font-medium">No Jobs Found</p>
                        <p className="text-sm">Check your Supabase connection and data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Route Map */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-400" />
                    Optimized Route Map
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden border-2 border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-100 to-blue-200">
                      {/* Mock map elements */}
                      <div className="absolute top-16 left-8 w-20 h-16 bg-green-300 rounded-lg opacity-60"></div>
                      <div className="absolute bottom-20 right-12 w-24 h-18 bg-green-300 rounded-lg opacity-60"></div>
                      <div className="absolute top-32 left-48 w-40 h-24 bg-blue-400 rounded-2xl opacity-70"></div>
                      
                      {/* Route line */}
                      <svg className="absolute inset-0 w-full h-full">
                        <path 
                          d="M 80 80 L 180 120 L 280 160 L 380 200 L 460 240"
                          stroke="#1d4ed8" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeDasharray="10,5"
                          className="animate-pulse"
                        />
                      </svg>
                      
                      {/* Job markers */}
                      {optimizedRoute.slice(0, 5).map((job, index) => {
                        const positions = [
                          { top: '20%', left: '15%' },
                          { top: '30%', left: '35%' },
                          { top: '50%', left: '55%' },
                          { top: '60%', left: '80%' },
                          { top: '40%', left: '70%' },
                        ];
                        
                        const position = positions[index];
                        const statusColors = {
                          'pending': 'bg-amber-500',
                          'in_progress': 'bg-blue-600 animate-pulse',
                          'completed': 'bg-emerald-500',
                          'delayed': 'bg-red-500'
                        };

                        return (
                          <div 
                            key={job.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            style={{ top: position.top, left: position.left }}
                          >
                            <div className={`w-8 h-8 ${statusColors[job.status]} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm`}>
                              {index + 1}
                            </div>
                            
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              <div className="font-bold">{job.customerName}</div>
                              <div className="text-blue-200">{job.service}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                      <h4 className="font-bold text-gray-800 text-sm">{selectedIndustry === 'landscaping' ? '📍 Loudoun County, VA' : '📍 Baltimore, MD'}</h4>
                      <p className="text-xs text-gray-600">Service Area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          )}

          {activeTab === 'routes' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
              <div className="bg-white/10 border-b border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-400" />
                  Route Optimization for {currentCrew?.name}
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats.totalJobs}</div>
                    <div className="text-sm text-blue-100">Total Jobs</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{Math.round(stats.totalWorkTime / 60)}h</div>
                    <div className="text-sm text-green-100">Work Time</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{Math.round(stats.totalDriveTime / 60)}h</div>
                    <div className="text-sm text-orange-100">Drive Time</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{stats.efficiency}%</div>
                    <div className="text-sm text-purple-100">Efficiency</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {optimizedRoute.map((job, index) => (
                    <div key={job.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{job.customerName}</h4>
                          <p className="text-sm text-white/80">{job.service} • {job.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-sm">🕒 {Math.round(job.estimatedDuration / 60)}h {job.estimatedDuration % 60}m</p>
                          {job.driveTo && <p className="text-white/60 text-xs">🚗 {job.driveTo.distance}mi • {job.driveTo.duration}min</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SMS Send Panel */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-orange-400" />
                    Send SMS
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Recipient</label>
                      <input
                        type="text"
                        value={smsRecipient}
                        onChange={(e) => setSmsRecipient(e.target.value)}
                        className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        placeholder="Customer name or phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/80 mb-2">Message</label>
                      <textarea
                        rows={4}
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                        className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                        placeholder="Write your message..."
                      />
                    </div>

                    <button
                      onClick={() => sendSMS()}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Send className="h-4 w-4" />
                      Send SMS
                    </button>
                  </div>

                  {/* Quick Templates */}
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-white/80 mb-4">Quick Templates</h4>
                    <div className="space-y-2">
                      {[
                        "Hi! Your technician is on the way and will arrive within 30 minutes.",
                        "We've completed your service. Thank you for choosing us!",
                        "Your appointment is scheduled for today. We'll call before arrival.",
                        "Weather delay: We'll reschedule your outdoor service.",
                      ].map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setSmsMessage(template)}
                          className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white/80 text-sm transition-all duration-200"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Communications */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-400" />
                    Customer Communications
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{job.customerName}</h4>
                            <p className="text-sm text-white/80">{job.service}</p>
                            <p className="text-xs text-white/60 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {job.customerPhone}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendSMS(job, 'arrival')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            On Way
                          </button>
                          <button
                            onClick={() => sendSMS(job, 'completion')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
                <div className="bg-white/10 border-b border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-400" />
                    Job Photos
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-center space-x-4 mb-8">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Photo
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Capture Photo
                    </button>
                  </div>
                  
                  <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                    <FileImage className="h-16 w-16 mx-auto mb-4 text-white/40" />
                    <h4 className="text-xl font-semibold text-white mb-2">No Photos Yet</h4>
                    <p className="text-white/80">Photos from completed jobs will appear here</p>
                  </div>
                  
                  {/* Photo Grid Placeholder */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 opacity-50">
                        <div className="h-32 bg-white/10 flex items-center justify-center text-white/40">
                          <Camera className="h-8 w-8" />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-white text-sm">Coming Soon</p>
                          <p className="text-white/60 text-xs">Job photos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* AI Insights Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-8 w-8" />
                  <div>
                    <h3 className="text-2xl font-bold">AI Operations Insights</h3>
                    <p className="text-purple-100">Real-time analysis and actionable recommendations</p>
                  </div>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          insight.type === 'optimization' ? 'bg-blue-500/20 text-blue-400' :
                          insight.type === 'efficiency' ? 'bg-green-500/20 text-green-400' :
                          insight.type === 'weather' ? 'bg-yellow-500/20 text-yellow-400' :
                          insight.type === 'customer' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-pink-500/20 text-pink-400'
                        }`}>
                          {insight.type === 'optimization' && <TrendingUp className="h-5 w-5" />}
                          {insight.type === 'efficiency' && <BarChart3 className="h-5 w-5" />}
                          {insight.type === 'weather' && <CloudSun className="h-5 w-5" />}
                          {insight.type === 'customer' && <Users className="h-5 w-5" />}
                          {insight.type === 'financial' && <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-4">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">
                        <span className="font-medium">Impact:</span> {insight.impact}
                      </div>
                      {insight.action && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
                <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Performance Metrics
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{stats.efficiency}%</div>
                    <div className="text-white/80">Route Efficiency</div>
                    <div className="text-sm text-white/60 mt-1">
                      {stats.efficiency >= 80 ? '🟢 Excellent' : stats.efficiency >= 70 ? '🟡 Good' : '🔴 Needs Improvement'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {Math.round((stats.completedJobs / stats.totalJobs) * 100 || 0)}%
                    </div>
                    <div className="text-white/80">Completion Rate</div>
                    <div className="text-sm text-white/60 mt-1">
                      {stats.completedJobs}/{stats.totalJobs} jobs completed
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {Math.round(stats.totalWorkTime / 60)}h
                    </div>
                    <div className="text-white/80">Total Work Time</div>
                    <div className="text-sm text-white/60 mt-1">
                      {Math.round(stats.totalDriveTime / 60)}h drive time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add other tab content here as needed */}
          
        </div>
      </div>
    </div>
  );
}