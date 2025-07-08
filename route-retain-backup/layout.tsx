// app/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900`}>
        {/* GLOBAL HEADER - Dashboard button removed */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Corval.ai Logo */}
              <Image
                src="/corvallogo.png"
                alt="Corval.ai Logo"
                width={100}
                height={30}
                priority
                className="object-contain"
              />
              {/* Route & Retain Logo/Title */}
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Route & Retain</span>
            </div>

            {/* Global Navigation Links - Dashboard removed, active page highlighting added */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link 
                href="/jobs" 
                className={`transition-colors px-3 py-2 rounded-lg ${
                  isActive('/jobs') 
                    ? 'text-white bg-white/30 font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Jobs
              </Link>
              <Link 
                href="/sms" 
                className={`transition-colors px-3 py-2 rounded-lg ${
                  isActive('/sms') 
                    ? 'text-white bg-white/30 font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                SMS Center
              </Link>
              <Link 
                href="/route-optimizer" 
                className={`transition-colors px-3 py-2 rounded-lg ${
                  isActive('/route-optimizer') 
                    ? 'text-white bg-white/30 font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Routes
              </Link>
              <Link 
                href="/photos" 
                className={`transition-colors px-3 py-2 rounded-lg ${
                  isActive('/photos') 
                    ? 'text-white bg-white/30 font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Photos
              </Link>
              <Link 
                href="/weather" 
                className={`transition-colors px-3 py-2 rounded-lg ${
                  isActive('/weather') 
                    ? 'text-white bg-white/30 font-semibold' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                Weather
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}