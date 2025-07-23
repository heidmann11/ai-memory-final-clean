'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { Clock, MapPin, Building2, Wrench, Leaf } from 'lucide-react';

// Enhanced interface to handle both company data structures
export interface JobLocation {
  id: string;
  customerName: string | null;
  address: string | null;
  coordinates: { lat: number | null; lng: number | null };
  service: string | null;
  priority: string;
  status: string;
  estimatedDuration: number | null;
  title: string | null;
  description: string | null;
  scheduledStart: string;
  city: string | null;
  estimatedCost: number | null;
  // New fields for landscaping
  serviceType?: string | null;
  specialInstructions?: string | null;
  equipmentRequired?: string[] | null;
  company?: string;
}

// Company configuration
const companies = [
  { 
    id: 'swc', 
    name: 'SWC', 
    shortName: 'SWC',
    industry: 'cleaning', 
    table: 'jobs', 
    theme: 'blue',
    icon: '🧽',
    description: 'Professional Cleaning Services'
  },
  { 
    id: 'dd', 
    name: 'D&D Landscaping', 
    shortName: 'D&D',
    industry: 'landscaping', 
    table: 'service_jobs', 
    theme: 'green',
    icon: '🌱',
    description: 'Lawn Care & Landscaping'
  }
];

// Helper functions for styling
const getStatusColor = (status: string, theme: string = 'blue') => {
  const baseColors = {
    blue: {
      pending: 'bg-yellow-400/20 text-yellow-300',
      in_progress: 'bg-blue-400/20 text-blue-300',
      completed: 'bg-green-400/20 text-green-300',
      default: 'bg-gray-400/20 text-gray-300'
    },
    green: {
      pending: 'bg-amber-400/20 text-amber-300',
      in_progress: 'bg-emerald-400/20 text-emerald-300', 
      completed: 'bg-green-400/20 text-green-300',
      default: 'bg-gray-400/20 text-gray-300'
    }
  };

  const colors = baseColors[theme as keyof typeof baseColors] || baseColors.blue;
  return colors[status?.toLowerCase() as keyof typeof colors] || colors.default;
};

const getPriorityColor = (priority: string, theme: string = 'blue') => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-400/20 text-red-300';
    case 'medium':
      return theme === 'green' ? 'bg-orange-400/20 text-orange-300' : 'bg-orange-400/20 text-orange-300';
    case 'low':
      return 'bg-gray-400/20 text-gray-300';
    default:
      return 'bg-gray-400/20 text-gray-300';
  }
};

const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'green':
      return {
        gradient: 'from-green-900 via-green-800 to-emerald-900',
        accent: 'border-green-500/30 bg-green-500/10',
        button: 'bg-green-600 hover:bg-green-700'
      };
    case 'blue':
    default:
      return {
        gradient: 'from-blue-900 via-blue-800 to-purple-900',
        accent: 'border-blue-500/30 bg-blue-500/10', 
        button: 'bg-blue-600 hover:bg-blue-700'
      };
  }
};

export default function JobsPage() {
  const { user, loading: userLoading } = useUser();
  const [jobs, setJobs] = useState<JobLocation[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('swc'); // Default to SWC
  const [error, setError] = useState<string | null>(null);

  const currentCompany = companies.find(c => c.id === selectedCompany) || companies[0];
  const themeColors = getThemeColors(currentCompany.theme);

  useEffect(() => {
    if (!user) {
      setJobsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setJobsLoading(true);
      setError(null);
      const supabase = createClient();

      try {
        let query = supabase.from(currentCompany.table).select('*');

        // Add industry filter for service_jobs table
        if (currentCompany.table === 'service_jobs') {
          query = query.eq('industry', currentCompany.industry).eq('status', 'active');
        }

        // Add search filters
        if (searchTerm) {
          if (currentCompany.table === 'service_jobs') {
            query = query.or(`customer_name.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
          } else {
            query = query.or(`customer_name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
          }
        }

        // Add status filter (only for cleaning jobs that have status in DB)
        if (statusFilter && currentCompany.table === 'jobs') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query.order('id', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          setError(`Failed to fetch ${currentCompany.name} jobs: ${error.message}`);
          setJobs([]);
        } else {
          console.log(`Successfully fetched ${currentCompany.name} data:`, data);
          
          // Transform data based on table structure
          const formattedData: JobLocation[] = data.map(job => {
            if (currentCompany.table === 'service_jobs') {
              // Handle landscaping data structure
              return {
                id: job.id.toString(),
                title: job.service_type || 'Landscaping Service',
                address: job.address,
                city: job.city,
                customerName: job.customer_name,
                description: job.special_instructions || 'Standard landscaping service',
                estimatedCost: null, // Landscaping doesn't have cost in current structure
                estimatedDuration: job.estimated_duration || 60,
                priority: job.priority === 1 ? 'high' : job.priority === 3 ? 'low' : 'medium',
                scheduledStart: new Date().toISOString(), // Default to today since landscaping jobs don't have scheduled start
                service: job.service_type,
                status: 'pending', // All landscaping jobs are pending by default
                coordinates: { lat: job.lat, lng: job.lng },
                serviceType: job.service_type,
                specialInstructions: job.special_instructions,
                equipmentRequired: job.equipment_required,
                company: currentCompany.id
              };
            } else {
              // Handle cleaning data structure (existing)
              return {
                id: job.id,
                title: job.title,
                address: job.address,
                city: job.city,
                customerName: job.customer_name,
                description: job.description,
                estimatedCost: job.estimated_cost,
                estimatedDuration: job.estimated_duration,
                priority: job.priority ?? 'low',
                scheduledStart: job.scheduled_start ?? new Date().toISOString(),
                service: job.service,
                status: job.status ?? 'pending',
                coordinates: { lat: job.lat, lng: job.lng },
                company: currentCompany.id
              };
            }
          });
          
          setJobs(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error fetching ${currentCompany.name} jobs`);
        setJobs([]);
      }
      
      setJobsLoading(false);
    };

    const searchTimeout = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, statusFilter, selectedCompany, user, currentCompany]);

  if (userLoading || jobsLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.gradient} text-white p-6 flex items-center justify-center`}>
        <div className="text-xl">Loading {currentCompany.name} jobs...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.gradient} text-white p-6 flex items-center justify-center`}>
          <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.gradient} text-white p-6`}>
      
      {/* Header with Company Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <span className="text-5xl">{currentCompany.icon}</span>
            {currentCompany.name} Jobs
          </h1>
          <p className="text-white/80 mt-2">{currentCompany.description}</p>
        </div>
        
        {/* Company Selector */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
          <label htmlFor="company" className="block text-sm font-medium text-white/70 mb-2">Select Company</label>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-3 border border-white/30 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {companies.map(company => (
              <option key={company.id} value={company.id} className="bg-gray-800 text-white">
                {company.icon} {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-white/70 mb-1">Search</label>
            <input
              id="search"
              type="text"
              placeholder={`🔍 Search ${currentCompany.shortName} jobs...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Status Filter - Only show for cleaning jobs */}
          {currentCompany.table === 'jobs' && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white/70 mb-1">Status</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {/* Stats */}
          <div className="md:col-span-2 flex items-center justify-center">
            <div className={`${themeColors.accent} rounded-lg p-4 text-center`}>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <div className="text-sm text-white/70">{currentCompany.shortName} Jobs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${themeColors.accent}`}>
                    {currentCompany.shortName}
                  </span>
                </div>
                <p className="text-white/80 text-sm font-medium">{job.customerName}</p>
                <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {job.address}, {job.city}
                </p>
              </div>
              
              <div className="space-y-2">
                {/* Scheduled time - only for cleaning jobs */}
                {currentCompany.table === 'jobs' && (
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4"/>
                    {new Date(job.scheduledStart).toLocaleDateString()} at {new Date(job.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                
                {/* Duration and Cost */}
                <div className="flex items-center gap-4 text-sm text-white/80">
                  {job.estimatedDuration && (
                    <span>⏱️ {job.estimatedDuration} min</span>
                  )}
                  {job.estimatedCost && (
                    <span>💰 ${job.estimatedCost}</span>
                  )}
                </div>
                
                {/* Service Description */}
                <p className="text-white/80 text-sm">{job.description}</p>
                
                {/* Equipment Required - for landscaping jobs */}
                {job.equipmentRequired && job.equipmentRequired.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-white/60 mb-1">Equipment Required:</p>
                    <div className="flex flex-wrap gap-1">
                      {job.equipmentRequired.map((equipment, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded border border-white/20">
                          {equipment.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Status and Priority Badges */}
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status, currentCompany.theme)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(job.priority, currentCompany.theme)}`}>
                    {job.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-white/70 py-12 bg-white/10 rounded-lg shadow-lg border border-white/20 backdrop-blur-md">
            <div className="text-6xl mb-4">{currentCompany.icon}</div>
            <h2 className="text-2xl font-semibold mb-2">No {currentCompany.name} Jobs Found</h2>
            <p>
              {searchTerm || statusFilter 
                ? `No jobs match your current filters for ${currentCompany.shortName}.`
                : `No jobs are currently assigned for ${currentCompany.name}.`
              }
            </p>
            {(searchTerm || statusFilter) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className={`mt-4 px-4 py-2 ${themeColors.button} text-white rounded-lg hover:shadow-lg transition-all duration-200`}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Company Info Footer */}
      <div className="mt-12 text-center text-white/60">
        <p className="text-sm">
          Currently viewing {jobs.length} jobs for {currentCompany.name} • 
          Switch companies using the selector above
        </p>
      </div>
    </div>
  );
}