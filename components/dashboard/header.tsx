'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { user } = useAuth();
  const supabase = createClient();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Capacity', href: '/capacity-scorecard' }, // NEW: Your competitive advantage page
    { name: 'Jobs', href: '/jobs' },
    { name: 'Routes', href: '/route-optimizer' },
    { name: 'Financial', href: '/financial' },
    { name: 'SMS', href: '/sms' },
    { name: 'Photos', href: '/photos' },
    { name: 'Weather', href: '/weather' }
  ];

  return (
    <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 0L6 12h4l-1 12 7-12h-4l1-12z"/>
              </svg>
            </div>
            <span className="text-white text-lg font-semibold whitespace-nowrap">
              Route & Retain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-200 ${
                    isActive ? 'text-white' : 'text-blue-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="flex items-center">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="text-sm text-blue-200 hover:text-white transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}