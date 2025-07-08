// components/Navbar.tsx
'use client'; // This component will have client-side interactivity (e.g., links)

import React from 'react';
import Link from 'next/link'; // For client-side navigation
import { usePathname } from 'next/navigation'; // To highlight the active link

export default function Navbar() {
  const pathname = usePathname(); // Get the current URL path

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/jobs' }, // Your Jobs list page
    { name: 'Route Optimizer', href: '/route-optimizer' },
    { name: 'Reports', href: '/reports' }, // Placeholder for your future Reports page
    { name: 'Pricing', href: '/pricing' }, // From your homepage screenshot
    { name: 'Features', href: '/features' }, // From your homepage screenshot
  ];

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-white text-2xl font-bold hover:text-gray-300 transition-colors">
          Route & Retain
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${pathname === item.href
                  ? 'bg-gray-900 text-white' // Styling for the active link
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Styling for inactive links
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}