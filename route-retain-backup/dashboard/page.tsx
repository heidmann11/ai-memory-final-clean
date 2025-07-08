// app/dashboard/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import GoogleMapComponent, { JobLocation } from '../../components/GoogleMapComponent';
import { initialMockJobs } from '../../lib/mockJobsData';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

import CreateJobModal from '../../components/CreateJobModal';

export default function DashboardPage() {
  const [jobsData, setJobsData] = useState<JobLocation[]>(initialMockJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobLocation | null>(null); // NEW: State for selected job

  const handleOptimizedRoute = useCallback((optimizedJobs: JobLocation[]) => {
    console.log('Route Optimized! New Order:', optimizedJobs.map(j => j.customerName));
    if (JSON.stringify(optimizedJobs) !== JSON.stringify(jobsData)) {
      setJobsData(optimizedJobs);
    }
  }, [jobsData]);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: Google Maps API Key not configured. Please set NEXT_PUBLIC_Maps_API_KEY in your .env.local file.
      </div>
    );
  }

  const handleSaveNewJob = useCallback((newJob: JobLocation) => {
    setJobsData(prevJobs => [newJob, ...prevJobs]);
    console.log("DEBUG: New job added via modal:", newJob.title);
  }, []);

  const [selectedCrew, setSelectedCrew] = useState<string>('all');

  const technicianOptions = [
    { id: 'tech1', name: 'Technician A' },
    { id: 'tech2', name: 'Technician B' },
    { id: 'tech3', name: 'John Admin' },
    { id: 'tech4', name: 'Sarah Chen' },
    { id: 'tech5', name: 'Mike Rodriguez' },
  ];

  const handleReassign = (jobId: string, newAssigneeId: string) => {
    console.log(`DEBUG: Reassigning job ${jobId} to technician ID ${newAssigneeId} (mocked).`);
    const assignedTechName = technicianOptions.find(tech => tech.id === newAssigneeId)?.name || 'Unknown';
    alert(`Job reassigned to ${assignedTechName} (mocked)!`);
  };

  const filteredJobs = jobsData.filter(job => {
    if (selectedCrew === 'all') {
      return true;
    }
    return job.assignedToId === selectedCrew;
  });

  // NEW: handleMarkCompleted and handleSendSms now in parent component
  const handleMarkCompleted = useCallback((jobId: string) => {
    setJobsData(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          return { ...job, status: 'completed' };
        }
        return job;
      })
    );
    setSelectedJob(prev => prev && prev.id === jobId ? { ...prev, status: 'completed' } : prev);
    console.log(`Job ${jobId} marked as completed (mocked).`);
  }, []);

  const handleSendSms = useCallback((customerName: string) => {
    alert(`SMS sent to ${customerName} (mocked)!`);
    console.log(`Mock SMS sent to ${customerName}.`);
  }, []);


  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50 overflow-y-auto">
      {/* Header and KPI Cards */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Route & Retain Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-blue-600">{jobsData.length}</span>
              <span className="text-sm text-gray-500">Total Jobs</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-yellow-600">{jobsData.filter(job => job.status === 'pending' || job.status === 'scheduled').length}</span>
              <span className="text-sm text-gray-500">Pending</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-indigo-600">{jobsData.filter(job => job.status === 'in_progress').length}</span>
              <span className="text-sm text-gray-500">In Progress</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-green-600">{jobsData.filter(job => job.status === 'completed').length}</span>
              <span className="text-sm text-gray-500">Completed</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-purple-600">$X</span>
              <span className="text-sm text-gray-500">Est. Revenue (Mock)</span>
          </div>
        </div>
      </div>

      {/* "Add New Job" Button and Crew Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto">
          Add New Job
        </button>

        <div className="text-sm flex-shrink-0">
          <label htmlFor="crew-filter" className="mr-2 text-gray-700 font-semibold">Crew:</label>
          <select
            id="crew-filter"
            className="p-2 border rounded"
            value={selectedCrew}
            onChange={(e) => setSelectedCrew(e.target.value)}
          >
            <option value="all">All Crews</option>
            {technicianOptions.map(tech => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area: Map and Recent Jobs (Expanded to include Legend/Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow mb-6"> {/* Changed to lg:grid-cols-4 */}

        {/* Map and Info/Legend Panel (Column 1-3 on large screens) */}
        <div className="lg:col-span-3 min-h-[500px] flex flex-col gap-6"> {/* Map takes 3/4 width on large screens, new flex column */}
            <div className="flex-grow"> {/* Map container fills available space */}
                <GoogleMapComponent
                    jobs={filteredJobs}
                    onRouteOptimized={handleOptimizedRoute}
                    apiKey={googleMapsApiKey}
                    height="100%"
                    width="100%"
                    mapTitle="Baltimore, MD • Route & Retain"
                    selectedJob={selectedJob} // Pass selectedJob state
                    setSelectedJob={setSelectedJob} // Pass setSelectedJob handler
                />
            </div>
            {/* Legend - MOVED FROM GOOGLEMAPCOMPONENT */}
            <div className="bg-white p-4 rounded-lg shadow-md text-xs border border-gray-200">
                <div className="font-bold mb-1">Route Legend</div>
                <div className="flex items-center gap-1 mb-0.5">
                    <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                    <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                    <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
                    <span>High Priority</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-0.5 bg-[#3b82f6]"></div>
                    <span>Optimized Route</span>
                </div>
            </div>
        </div>

        {/* Job Summary & Selected Job Details (Column 4 on large screens) */}
        <div className="lg:col-span-1 flex flex-col gap-6"> {/* Job Summary & Details column */}
            {/* Job Summary - MOVED FROM GOOGLEMAPCOMPONENT */}
            <div className="bg-white p-4 rounded-lg shadow-md text-xs border border-gray-200 flex-grow"> {/* flex-grow to fill vertical space */}
                <div className="font-bold mb-1">Job Summary</div>
                {filteredJobs.slice(0, 4).map((job, index) => ( // Displaying first 4 jobs for brevity
                    <div
                        key={job.id}
                        className={`mb-1.5 flex items-center gap-1 p-1 rounded cursor-pointer transition-colors duration-200
                          ${selectedJob?.id === job.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                            setSelectedJob(job);
                            console.log("DEBUG: Job Summary item clicked, selectedJob set to:", job.customerName);
                        }}
                    >
                        <div
                            style={{ backgroundColor: job.status === 'in_progress' ? '#3b82f6' : job.status === 'completed' ? '#10b981' : job.priority === 'high' || job.priority === 'HIGH' ? '#ef4444' : '#6b7280' }}
                            className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                        >
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">{job.customerName}</div>
                            <div className="text-gray-600">{job.service}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Job Details Panel (Appears on marker/summary click) - MOVED FROM GOOGLEMAPCOMPONENT */}
            {selectedJob && (
                <div className="bg-white p-4 rounded-lg shadow-xl text-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 flex items-center justify-between">
                        {selectedJob.customerName} - {selectedJob.service}
                        <button
                            className="text-gray-500 hover:text-gray-800 text-xl font-bold ml-4"
                            onClick={() => setSelectedJob(null)}
                        >
                            &times;
                        </button>
                    </h3>
                    <p className="text-gray-700 mb-1"><strong>Address:</strong> {selectedJob.address}</p>
                    <p className="text-gray-700 mb-1">
                        <strong>Status:</strong>{' '}
                        <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold
                          ${selectedJob.status === 'in_progress' ? 'bg-blue-500' :
                            selectedJob.status === 'completed' ? 'bg-green-500' :
                            selectedJob.priority === 'high' ? 'bg-red-500' : 'bg-gray-500'}`}
                        >
                          {selectedJob.status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                    </p>
                    <p className="text-gray-700 mb-2">
                        <strong>Priority:</strong>{' '}
                        <span className={`font-semibold
                          ${selectedJob.priority === 'high' ? 'text-red-600' :
                            selectedJob.priority === 'medium' ? 'text-orange-500' : 'text-gray-600'}`}
                        >
                          {selectedJob.priority.charAt(0).toUpperCase() + selectedJob.priority.slice(1)}
                        </span>
                    </p>

                    <div className="flex gap-2 mt-4">
                        {selectedJob.status !== 'completed' && (
                            <button
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                onClick={() => handleMarkCompleted(selectedJob.id)}
                            >
                                Mark as Completed
                            </button>
                        )}
                        <button
                            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                            onClick={() => handleSendSms(selectedJob.customerName)}
                        >
                            Send SMS
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Weather Card */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-start">
          <h3 className="font-bold text-gray-700 mb-2">☁️ Weather Forecast</h3>
          <p className="text-gray-600 text-sm">Current: Sunny, 78°F. Next 24h: No rain expected.</p>
          <p className="text-gray-600 text-sm mt-1">Perfect for outdoor jobs!</p>
        </div>
        {/* Financial Card */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-start">
          <h3 className="font-bold text-gray-700 mb-2">📊 Financial Integration (QuickBooks)</h3>
          <p className="text-gray-600 text-sm">Last Sync: Today, 3:05 PM</p>
          <p className="text-gray-600 text-sm mt-1">3 Invoices Pending Payment.</p>
        </div>
        {/* AI Insights Card */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-start">
          <h3 className="font-bold text-gray-700 mb-2">🧠 AI Insights (OpenAI)</h3>
          <p className="text-gray-600 text-sm">Route Efficiency Suggestion: +5%</p>
          <p className="text-gray-600 text-sm mt-1">Predicted Customer Satisfaction: 92%</p>
        </div>
      </div>

      {/* Render the modal component */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveJob={handleSaveNewJob}
      />
    </div>
  );
}