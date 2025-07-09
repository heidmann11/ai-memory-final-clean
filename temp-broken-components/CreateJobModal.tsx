// components/CreateJobModal.tsx
'use client';

import React, { useState } from 'react';
import { JobLocation } from './GoogleMapComponent';
import { v4 as uuidv4 } from 'uuid';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (newJob: JobLocation) => void;
}

export default function CreateJobModal({ isOpen, onClose, onSaveJob }: CreateJobModalProps) {
  if (!isOpen) return null;

  // Form state variables
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');

  const technicianOptions = [
    { id: '', name: 'Select Technician' },
    { id: 'tech1', name: 'Technician A' },
    { id: 'tech2', name: 'Technician B' },
    { id: 'tech3', name: 'John Admin' },
    { id: 'tech4', name: 'Sarah Chen' },
    { id: 'tech5', name: 'Mike Rodriguez' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceAddress || !customerName || !jobTitle || !date || !time || !assignedTechnicianId) {
      alert("Please fill in all required fields: Customer Name, Job Title, Address, Date, Time, and Assign Technician.");
      return;
    }

    const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

    if (!googleMapsApiKey) {
      alert("Google Maps API Key not found in .env.local. Cannot geocode.");
      return;
    }

    try {
      const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(serviceAddress)}&key=${googleMapsApiKey}`;
      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;
        const city = data.results[0].address_components.find((comp: any) => comp.types.includes('locality'))?.long_name || '';
        const state = data.results[0].address_components.find((comp: any) => comp.types.includes('administrative_area_level_1'))?.short_name || '';
        const zipCode = data.results[0].address_components.find((comp: any) => comp.types.includes('postal_code'))?.long_name || '';

        alert(`Address geocoded successfully! Lat: ${lat}, Lng: ${lng}`);

        const newJob: JobLocation = {
          id: uuidv4(),
          companyId: uuidv4(),
          customerName: customerName,
          address: formattedAddress,
          coordinates: { lat, lng },
          service: jobTitle,
          priority: "medium",
          status: "pending",
          estimatedDuration: 60,
          title: jobTitle,
          description: description,
          type: "maintenance",
          customerId: uuidv4(),
          assignedToId: assignedTechnicianId,
          createdBy: uuidv4(),
          scheduledStart: `${date}T${time}:00Z`,
          actualStart: null,
          actualEnd: null,
          city: city,
          state: state,
          zipCode: zipCode,
          estimatedCost: 100,
          actualCost: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onSaveJob(newJob);
        onClose();
        alert(`Job "${newJob.title}" created successfully and added to map!`);

      } else {
        alert(`Geocoding failed for address: "${serviceAddress}". Status: ${data.status || 'Unknown Status'}. Please try a more specific address.`);
      }
    } catch (error) {
      console.error('Error during client-side geocoding:', error);
      alert('Failed to geocode address due to network error. Check console for details.');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* FIXED MODAL STRUCTURE - Better height management */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* FIXED HEADER - Always visible */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Create New Job</h1>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="create-job-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer Information */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input 
                    type="text" 
                    id="customerName" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    id="phoneNumber" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input 
                    type="text" 
                    id="jobTitle" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Service Address */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Service Address</h2>
              <div>
                <label htmlFor="serviceAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input 
                  type="text" 
                  id="serviceAddress" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={serviceAddress} 
                  onChange={(e) => setServiceAddress(e.target.value)} 
                  placeholder="e.g., 123 Main St, Baltimore, MD 21201"
                  required 
                />
              </div>
            </div>

            {/* Scheduling & Assignment */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Scheduling & Assignment</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input 
                      type="date" 
                      id="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input 
                      type="time" 
                      id="time" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assignedTechnician" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Technician *
                  </label>
                  <select 
                    id="assignedTechnician" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={assignedTechnicianId} 
                    onChange={(e) => setAssignedTechnicianId(e.target.value)}
                    required
                  >
                    {technicianOptions.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Extra space at bottom to ensure form is fully scrollable */}
            <div className="h-4"></div>
          </form>
        </div>

        {/* FIXED FOOTER - Always visible */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            type="button" 
            onClick={handleCancel} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-job-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
}