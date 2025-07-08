// components/ClientHeader.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Route, MessageSquare, Camera, Home, LayoutDashboard, CloudSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClientHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logos and Branding */}
          <div className="flex items-center space-x-6">
            {/* Logos */}
            <div className="flex items-center space-x-3">
              {/* Corval.ai Logo - Handle missing file gracefully */}
              <div className="relative">
                <Image
                  src="/corvallogo.png"
                  alt="Corval.ai Logo"
                  width={100}
                  height={30}
                  priority
                  className="object-contain"
                  onError={(e) => {
                    // Hide image if file doesn't exist
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback text if image doesn't load */}
                <div className="text-slate-600 font-bold text-lg hidden" id="corval-fallback">
                  Corval.ai
                </div>
              </div>

              {/* Route & Retain Logo */}
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Route & Retain
                </h1>
              </div>
            </div>

            {/* Page-specific title section - only show on larger screens */}
            <div className="hidden lg:block border-l border-slate-200 pl-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                  <Route className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {pathname === '/route-optimizer' && 'AI Route Optimizer'}
                    {pathname === '/sms' && 'SMS Center'}
                    {pathname === '/photos' && 'Photo Management'}
                    {pathname === '/jobs' && 'Job Management'}
                    {pathname === '/weather' && 'Weather Center'}
                    {!pathname.includes('/route-optimizer') && !pathname.includes('/sms') && !pathname.includes('/photos') && !pathname.includes('/jobs') && !pathname.includes('/weather') && 'Route & Retain'}
                  </h2>
                  <p className="text-slate-600 text-sm">Smart scheduling and routing for service contractors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Navigation */}
          <nav className="flex items-center space-x-1">
            <Link 
              href="/jobs" 
              className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/jobs') 
                  ? 'text-slate-900 bg-green-100 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Jobs
            </Link>
            
            <Link 
              href="/sms" 
              className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/sms') 
                  ? 'text-slate-900 bg-green-100 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              SMS Center
            </Link>
            
            <Link 
              href="/route-optimizer" 
              className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/route-optimizer') 
                  ? 'text-slate-900 bg-green-100 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Routes
            </Link>
            
            <Link 
              href="/photos" 
              className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/photos') 
                  ? 'text-slate-900 bg-green-100 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Photos
            </Link>

            <Link 
              href="/weather" 
              className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                isActive('/weather') 
                  ? 'text-slate-900 bg-green-100 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Weather
            </Link>

            {/* Status Badge - only show on route optimizer page */}
            {isActive('/route-optimizer') && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Route Active
              </Badge>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}