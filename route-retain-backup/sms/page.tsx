// app/sms/page.tsx
'use client';

import React, { useState } from 'react';
// --- REMOVED ALL SHADCN UI COMPONENT IMPORTS ---
// Using plain HTML elements with Tailwind CSS instead to bypass "Module not found" error.
import { Send, MessageSquare, User, CalendarDays } from 'lucide-react'; // Icons are still fine

export default function SMSCenterPage() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message) {
      alert('Recipient and Message cannot be empty!');
      return;
    }
    console.log({ recipient, message, scheduledTime });
    alert(`SMS sent to ${recipient} at ${scheduledTime || 'now'}: "${message}"`);
    setRecipient('');
    setMessage('');
    setScheduledTime('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">SMS Communication Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Send New SMS Card - NOW USING PLAIN DIVS */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"> {/* Card styling */}
          <div className="mb-4"> {/* CardHeader styling */}
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"> {/* CardTitle styling */}
              <Send className="h-5 w-5 text-blue-600" /> Send New SMS
            </h2>
          </div>
          <div> {/* CardContent styling */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">Recipient (Phone Number or Customer Name)</label>
                <input
                  id="recipient"
                  type="text"
                  placeholder="e.g., 410-555-1234 or John Doe"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" // Input styling
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y" // Textarea styling
                ></textarea>
              </div>
              <div>
                <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">Schedule for Later (Optional)</label>
                <input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" // Input styling
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"> {/* Button styling */}
                <Send className="mr-2 h-4 w-4 inline-block align-middle" /> Send SMS
              </button>
            </form>
          </div>
        </div>

        {/* Recent Communications Card - NOW USING PLAIN DIVS */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"> {/* Card styling */}
          <div className="mb-4"> {/* CardHeader styling */}
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"> {/* CardTitle styling */}
              <MessageSquare className="h-5 w-5 text-green-600" /> Recent Communications
            </h2>
          </div>
          <div> {/* CardContent styling */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><User className="h-4 w-4"/> John Doe</span>
                  <span className="text-gray-500 flex items-center gap-1"><CalendarDays className="h-4 w-4"/> 2024-06-18 14:30</span>
                </div>
                <p className="text-gray-700 text-sm">"Your technician is en route and will arrive in 15 mins."</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-blue-800 flex items-center gap-1"><User className="h-4 w-4"/> Alice Smith</span>
                  <span className="text-blue-500 flex items-center gap-1"><CalendarDays className="h-4 w-4"/> 2024-06-17 09:00</span>
                </div>
                <p className="text-blue-700 text-sm">"Your service is scheduled for tomorrow at 9 AM."</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><User className="h-4 w-4"/> Bob Johnson</span>
                  <span className="text-gray-500 flex items-center gap-1"><CalendarDays className="h-4 w-4"/> 2024-06-16 11:15</span>
                </div>
                <p className="text-gray-700 text-sm">"Service complete. Please rate our service!"</p>
              </div>
               <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-1"><User className="h-4 w-4"/> Jane Doe</span>
                  <span className="text-gray-500 flex items-center gap-1"><CalendarDays className="h-4 w-4"/> 2024-06-15 16:00</span>
                </div>
                <p className="text-gray-700 text-sm">"Reminder: Your scheduled maintenance is due next week."</p>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0 text-center text-gray-500 text-sm"> {/* CardFooter styling */}
            Mock Communications. Real data to come.
          </div>
        </div>
      </div>
    </div>
  );
}