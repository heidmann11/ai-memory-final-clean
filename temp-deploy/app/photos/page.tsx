// app/photos/page.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

export default function PhotosPage() {
  const handleUploadPhoto = () => {
    alert('Simulating photo upload!');
  };

  const handleCapturePhoto = () => {
    alert('Simulating photo capture!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Job Photos</h1>

      <div className="flex space-x-4 mb-8"> {/* This div contains your buttons */}

        {/* --- First Button: Upload Photo --- */}
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 text-lg rounded-lg shadow-md min-w-fit"
          onClick={handleUploadPhoto}
        >
          {/* Wrap icon and text in a span with flex centering for precise alignment */}
          <span className="flex items-center justify-center">
            <Upload className="mr-2 h-5 w-5" /> Upload Photo
          </span>
        </Button>

        {/* --- Second Button: Capture Photo (Ensure only ONE of these) --- */}
        <Button
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded-lg shadow-md min-w-fit"
          onClick={handleCapturePhoto}
        >
          {/* Wrap icon and text in a span with flex centering for precise alignment */}
          <span className="flex items-center justify-center">
            <Camera className="mr-2 h-5 w-5" /> Capture Photo
          </span>
        </Button>

        {/* !!! IMPORTANT: IF YOU HAVE A THIRD <Button> TAG HERE, DELETE IT !!! */}
        {/* It might look something like this if it's a duplicate:
        <Button className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded-lg shadow-md min-w-fit"
                onClick={handleCapturePhoto}>
          <Camera className="mr-2 h-5 w-5" /> Capture Photo
        </Button>
        */}

      </div>

      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-xl border border-gray-200 text-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-4">No Photos Yet</h2>
        <p className="mb-4">Photos from completed jobs and inspections will appear here.</p>
        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xl">
          <Camera className="h-16 w-16" />
        </div>
      </div>

      {/* Placeholder for photo gallery */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {/* Example Photo Card (you'd map over actual photos here) */}
        {/*
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src="/path/to/your/image.jpg" alt="Job Photo" className="w-full h-48 object-cover"/>
          <div className="p-4 text-sm text-gray-700">
            <p className="font-semibold">Job ID: #12345</p>
            <p className="text-gray-500">Date: June 18, 2024</p>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}