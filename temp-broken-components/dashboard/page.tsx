'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import JobDetailSidebar from '@/components/dashboard/JobDetailSidebar';
import AddJobModal from '@/components/dashboard/AddJobModal';

export default function RouteRetainDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data, error } = await supabase.from('jobs').select('*').order('id', { ascending: false });
    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      const transformed = data.map((job) => ({
        id: job.id, customerName: job.customer_name, address: job.address,
        city: job.city, state: job.state, title: job.title, status: job.status,
        coordinates: { lat: job.lat ?? null, lng: job.lng ?? null },
        scheduledStart: job.scheduled_start ?? null,
      }));
      setJobs(transformed);
    }
  };

  useEffect(() => { if (user) { fetchJobs(); } }, [user]);

  const handleJobSelect = (job) => { setSelectedJob(job); };
  const handleCloseSidebar = () => { setSelectedJob(null); };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    const supabase = createClient();
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    if (error) {
      alert('Update failed');
    } else {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/80">Here's your operation overview.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-medium">
          <Plus className="h-4 w-4" /> Add New Job
        </button>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{jobs.length}</div><div className="text-sm">Total Jobs</div></div>
           <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{jobs.filter((j) => j.status === 'pending').length}</div><div className="text-sm">Pending</div></div>
           <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{jobs.filter((j) => j.status === 'in_progress').length}</div><div className="text-sm">In Progress</div></div>
           <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{jobs.filter((j) => j.status === 'completed').length}</div><div className="text-sm">Completed</div></div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-400" /> Job Locations & Route Planning
          </h2>
          <div className="h-96 bg-gray-700 rounded-lg overflow-hidden">
            <GoogleMapComponent
              jobs={jobs}
              onJobSelect={handleJobSelect}
              apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY || ''}
            />
          </div>
        </div>
      </main>
      <JobDetailSidebar job={selectedJob} onClose={handleCloseSidebar} onUpdateStatus={handleUpdateJobStatus} />
      {showAddModal && <AddJobModal onClose={() => setShowAddModal(false)} onSubmit={() => {}} />}
    </div>
  );
}