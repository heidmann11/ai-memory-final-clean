// app/jobs/page.tsx
'use client'; // Marking as client component as it will likely have interactive features

import React, { useState, useEffect } from 'react';
// --- REMOVED ALL SHADCN UI COMPONENT IMPORTS ---
// Using plain HTML elements with Tailwind CSS instead to bypass "Module not found" error.
import { Search, PlusCircle, MapPin, Clock, Truck, User } from 'lucide-react'; // Icons are still fine

interface Job {
  id: string;
  customerName: string;
  address: string;
  service: string;
  status: 'pending' | 'in_progress' | 'completed' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  scheduledTime: string;
  assignedTo?: string; // Technician/Crew ID
}

// Mock Data for Jobs (you can integrate with your existing mockJobsData.ts later)
const mockJobs: Job[] = [
  {
    id: 'j1',
    customerName: 'Bob Johnson',
    address: '700 E Pratt St, Baltimore, MD 21202',
    service: 'Plumbing Leak Repair',
    status: 'in_progress',
    priority: 'high',
    scheduledTime: '10:30 AM',
    assignedTo: 'tech2'
  },
  {
    id: 'j2',
    customerName: 'Alice Smith',
    address: '100 Light St, Baltimore, MD 21202',
    service: 'HVAC Tune-up',
    status: 'scheduled',
    priority: 'medium',
    scheduledTime: '09:00 AM',
    assignedTo: 'tech1'
  },
  {
    id: 'j3',
    customerName: 'David Green',
    address: '500 International Dr, Baltimore, MD 21202',
    service: 'Pest Control Treatment',
    status: 'pending',
    priority: 'low',
    scheduledTime: '03:00 PM',
    assignedTo: 'tech1'
  },
  {
    id: 'j4',
    customerName: 'Carol White',
    address: '300 W Lexington St, Baltimore, MD 21201',
    service: 'Electrical Outlet Installation',
    status: 'completed',
    priority: 'high',
    scheduledTime: '01:00 PM',
    assignedTo: 'tech3'
  },
  {
    id: 'j5',
    customerName: 'Eve Brown',
    address: '250 Key Hwy, Baltimore, MD 21230',
    service: 'Tree Pruning',
    status: 'scheduled',
    priority: 'medium',
    scheduledTime: '11:00 AM',
    assignedTo: 'tech2'
  }
];

const technicianOptions = [
    { id: 'tech1', name: 'Technician A' },
    { id: 'tech2', name: 'Technician B' },
    { id: 'tech3', name: 'John Admin' },
];


export default function JobsPage() {
  const [jobsData, setJobsData] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState('all');


  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
    const matchesAssignedTo = filterAssignedTo === 'all' || job.assignedTo === filterAssignedTo;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo;
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'; // Using blue for low for distinctness
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6"> {/* Global background applied here temporarily */}
      <h1 className="text-4xl font-bold mb-8 text-white">All Jobs</h1>

      {/* Controls and Filters - NOW USING PLAIN DIVS/INPUTS */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border border-white/20">
        <div className="col-span-full lg:col-span-1">
          <label htmlFor="search" className="sr-only">Search Jobs</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            <input
              id="search"
              type="text"
              placeholder="Search by customer, address, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-2 border border-white/30 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-white/70 mb-1">Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Job['status'] | 'all')}
            className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium text-white/70 mb-1">Priority</label>
          <select
            id="priority-filter"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Job['priority'] | 'all')}
            className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="assigned-to-filter" className="block text-sm font-medium text-white/70 mb-1">Assigned To</label>
          <select
            id="assigned-to-filter"
            value={filterAssignedTo}
            onChange={(e) => setFilterAssignedTo(e.target.value as string | 'all')}
            className="w-full p-2 border border-white/30 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="all">All Assignees</option>
            {technicianOptions.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Job Button - NOW USING PLAIN BUTTON */}
      <div className="mb-6 text-right">
        <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg shadow-md font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4 inline-block align-middle" /> Add New Job
        </button>
      </div>

      {/* Jobs List - NOW USING PLAIN DIVS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20"> {/* Card styling */}
              <div className="mb-4"> {/* CardHeader styling */}
                <h2 className="text-xl font-semibold text-white mb-1">{job.service}</h2> {/* CardTitle styling */}
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.address}
                </p>
              </div>
              <div className="space-y-2"> {/* CardContent styling */}
                <p className="text-white text-base flex items-center gap-1">
                  <User className="h-4 w-4"/> <strong>{job.customerName}</strong>
                </p>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4"/> Scheduled: {job.scheduledTime}
                </p>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Truck className="h-4 w-4"/> Assigned to: {technicianOptions.find(tech => tech.id === job.assignedTo)?.name || 'Unassigned'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}> {/* Badge styling */}
                    {job.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(job.priority)}`}> {/* Badge styling */}
                    {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-white/70 py-12 bg-white/10 rounded-lg shadow-lg border border-white/20 backdrop-blur-md">
            <h2 className="text-2xl font-semibold mb-2">No Jobs Found</h2>
            <p>Try adjusting your filters or add a new job.</p>
          </div>
        )}
      </div>
    </div>
  );
}