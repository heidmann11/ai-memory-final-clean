'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

// 👇 you'll need to import or receive your optimize handler somehow
// import { useRouteOptimizer } from '@/components/RouteOptimizerContext'

export default function Header() {
  const { user } = useAuth();
  const supabase = createClient();
  const pathname = usePathname();

  // placeholder — you'll wire this up to your `optimizeAllRoutes` function
  const handleOptimizeRoute = () => {
    // call your route optimizer here
    console.log('Optimize Route clicked');
  };

  const navItems = [
    { name: 'Capacity', href: '/capacity-scorecard' },
    { name: 'Operations', href: '/operations' },

    { name: 'Financial', href: '/financial' }
  ];

  return (
    <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left brand/logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-200 text-sm font-medium">Powered by</span>
            <span className="text-white font-bold text-lg">Corval.ai</span>
            <div className="w-px h-6 bg-blue-300/30 mx-2"/>
          </div>
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-lg font-semibold whitespace-nowrap">
              Route & Retain
            </span>
          </Link>
        </div>

        {/* Center nav + optional Optimize button */}
        <div className="flex items-center space-x-6">
          <nav className="flex items-center space-x-8">
            {navItems.map(item => {
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
              )
            })}
          </nav>

          {/* only show on /jobs */}
          {pathname === '/jobs' && (
            <button
              onClick={handleOptimizeRoute}
              className="text-sm font-medium 
                         bg-gradient-to-r from-red-500 to-red-600 
                         hover:from-red-600 hover:to-red-700 
                         text-white px-3 py-1 rounded-md 
                         transition-colors"
            >
              Optimize Route
            </button>
          )}
        </div>

        {/* Sign out */}
        <div>
          {user ? (
            <button
              onClick={async () => await supabase.auth.signOut()}
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
    </header>
  )
}