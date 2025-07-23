// app/photos/page.tsx
'use client';

import React from 'react';
import { Camera, Upload } from 'lucide-react';

export default function PhotosPage() {
  const handleUploadPhoto = () => {
    alert('Simulating photo upload!');
  };

  const handleCapturePhoto = () => {
    alert('Simulating photo capture!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Job Photos</h1>
          <p className="text-white/80">Capture and manage photos from job sites</p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          {/* Upload Photo Button */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 text-lg rounded-lg shadow-md transition-colors flex items-center"
            onClick={handleUploadPhoto}
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Photo
          </button>

          {/* Capture Photo Button */}
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded-lg shadow-md transition-colors flex items-center"
            onClick={handleCapturePhoto}
          >
            <Camera className="mr-2 h-5 w-5" />
            Capture Photo
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">No Photos Yet</h2>
          <p className="text-white/80 mb-6">Photos from completed jobs and inspections will appear here.</p>
          <div className="h-48 bg-white/10 rounded-lg flex items-center justify-center text-white/60">
            <Camera className="h-16 w-16" />
          </div>
        </div>

        {/* Placeholder for photo gallery */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Example Photo Cards - you'd map over actual photos here */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 overflow-hidden opacity-50">
              <div className="h-48 bg-white/10 flex items-center justify-center text-white/40">
                <Camera className="h-12 w-12" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-white">Job #placeholder</p>
                <p className="text-white/60 text-sm">Coming soon...</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-400" />
              Job Site Photos
            </h3>
            <p className="text-white/80">Capture before and after photos directly from your mobile device during job completion.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-green-400" />
              Upload & Organize
            </h3>
            <p className="text-white/80">Upload photos from any device and automatically organize them by job, date, and location.</p>
          </div>
        </div>
      </div>
    </div>
  );
}