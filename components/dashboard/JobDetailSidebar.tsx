'use client';

import React from 'react';
import { X, MapPin, Calendar, MessageSquare, Play, CheckCircle } from 'lucide-react';

export default function JobDetailSidebar({ job, onClose, onUpdateStatus }) {
  const isVisible = !!job;
  const handleSendSms = () => { alert(`Sending SMS for job: ${job ? job.title : ''}`); };

  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-slate-900/80 backdrop-blur-sm z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-800 h-full p-6 text-white flex flex-col shadow-2xl">
        {job && (
          <>
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Job Details</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20"><X className="h-6 w-6" /></button>
            </header>
            <section className="flex-grow">
              <h3 className="text-xl font-semibold text-orange-400 mb-2">{job.title}</h3>
              <p className="text-lg text-white/90 mb-4">{job.customerName}</p>
              <div className="space-y-4 text-white/80">
                <div className="flex items-start"><MapPin className="h-5 w-5 mr-3 mt-1 text-blue-400 flex-shrink-0" /><span>{`${job.address}, ${job.city}, ${job.state}`}</span></div>
                <div className="flex items-center"><Calendar className="h-5 w-5 mr-3 text-blue-400" /><span>{job.scheduledStart ? new Date(job.scheduledStart).toLocaleDateString() : 'Not Scheduled'}</span></div>
              </div>
            </section>
            <footer className="flex-shrink-0 mt-auto space-y-2">
              <button onClick={() => onUpdateStatus(job.id, 'in_progress')} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"><Play className="h-5 w-5" /> Start Job</button>
              <button onClick={handleSendSms} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition font-semibold"><MessageSquare className="h-5 w-5" /> Send SMS</button>
              <button onClick={() => onUpdateStatus(job.id, 'completed')} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition font-semibold"><CheckCircle className="h-5 w-5" /> Complete Job</button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}