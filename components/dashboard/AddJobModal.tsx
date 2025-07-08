'use client';

import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { getBaltimoreCoordinates } from '@/lib/getBaltimoreCoordinates';

export default function AddJobModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    address: '',
    city: '',
    state: 'MD',
    status: 'pending',
    service: '',
    priority: 'medium',
    estimatedDuration: '120',
    scheduledStart: ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.customer_name || !formData.address) {
      alert('Please fill in required fields');
      return;
    }

    const coordinates = getBaltimoreCoordinates(formData.address);
    onSubmit({ ...formData, coordinates });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Job</h2>
        <div className="space-y-3">
          {['title', 'customer_name', 'address', 'city'].map((field) => (
            <div key={field}>
              <label className="text-sm capitalize">{field.replace('_', ' ')}</label>
              <input
                className="w-full p-2 border rounded-md"
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            </div>
          ))}

          <div>
            <label className="text-sm">State</label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            >
              <option value="MD">MD</option>
              <option value="VA">VA</option>
              <option value="DC">DC</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Service</label>
            <input
              className="w-full p-2 border rounded-md"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm">Scheduled Start</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-md"
              value={formData.scheduledStart}
              onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border px-4 py-2 rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
