'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { Clock, MapPin } from 'lucide-react';

// This type should match your data structure.
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
}

// Helper functions for styling
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-400/20 text-yellow-300';
    case 'in_progress':
      return 'bg-blue-400/20 text-blue-300';
    case 'completed':
      return 'bg-green-400/20 text-green-300';
    default:
      return 'bg-gray-400/20 text-gray-300';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-400/20 text-red-300';
    case 'medium':
      return 'bg-orange-400/20 text-orange-300';
    case 'low':
      return 'bg-gray-400/20 text-gray-300';
    default:
      return 'bg-gray-400/20';
  }
};

export default function JobsPage() {
  const { user, loading: userLoading } = useUser();
  const [jobs, setJobs] = useState<JobLocation[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJobsLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setJobsLoading(true);
      const supabase = createClient();

      let query = supabase.from('jobs').select('*');

      // Add search filter
      if (searchTerm) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }

      // Add status filter
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs. Check console for details.');
      } else {
        const formattedData = data.map(job => ({
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
        }));
        setJobs(formattedData);
      }
      setJobsLoading(false);
    };

    const searchTimeout = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, statusFilter, user]);

  if (userLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6 flex items-center justify-center">
          <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-white">All Jobs</h1>

      {/* Filters Section */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border border-white/20">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-white/70 mb-1">Search</label>
          <input
            id="search"
            type="text"
            placeholder="🔍 Search by customer or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* Status Filter */}
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
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-1">{job.title}</h2>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.address}, {job.city}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4"/>
                  {new Date(job.scheduledStart).toLocaleDateString()} at {new Date(job.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-white/80 text-sm">
                  Duration: {job.estimatedDuration} minutes | Cost: ${job.estimatedCost}
                </p>
                <p className="text-white/80 text-sm">{job.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(job.priority)}`}>
                    {job.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-white/70 py-12 bg-white/10 rounded-lg shadow-lg border border-white/20 backdrop-blur-md">
            <h2 className="text-2xl font-semibold mb-2">No Jobs Found</h2>
            <p>This may be because you have no jobs assigned to your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}