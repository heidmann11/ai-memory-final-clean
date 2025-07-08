'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Jobs', href: '/jobs' },
  { label: 'Financial', href: '/financial' },
  { label: 'SMS Center', href: '/sms' },
  { label: 'Routes', href: '/route-optimizer' },
  { label: 'Photos', href: '/photos' },
  { label: 'Weather', href: '/weather' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Orange Gradient Lightning Bolt with Rounded Corners */}
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-lg flex items-center justify-center shadow-sm">
            <svg 
              className="w-5 h-5 text-white" 
              fill="currentColor" 
              viewBox="0 0 16 16"
            >
              <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-white group-hover:text-orange-200 transition-colors duration-300">
            Route & Retain
          </span>
        </Link>

        <nav className="hidden md:flex gap-8">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`font-semibold transition-all duration-200 ${
                pathname === href
                  ? 'text-white border-b-2 border-orange-400 pb-1'
                  : 'text-blue-100 hover:text-white hover:border-b-2 hover:border-orange-300 pb-1'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </div>
    </header>
  );
}