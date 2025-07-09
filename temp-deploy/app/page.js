'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, login } = useAuth();
  const router = useRouter();

  const handleDemoLogin = () => {
    login({
      id: '1',
      name: 'Demo User',
      email: 'demo@demo.com',
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Only AI-Powered <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Integrated Platform for Contractors
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Predictive intelligence connects operations, customers, and financials 
              while optimizing routes, skills, and workload to reduce costs and increase 
              insights and profitability.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!user ? (
              <button
                onClick={handleDemoLogin}
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            )}
            <button className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
              Watch Demo
            </button>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Job Management</h3>
              <p className="text-blue-200 text-sm">AI-powered scheduling and routing that optimizes your daily operations automatically.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mobile Field App</h3>
              <p className="text-blue-200 text-sm">Technicians manage jobs, capture photos, and update customers directly from their phones.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated Billing</h3>
              <p className="text-blue-200 text-sm">Generate invoices instantly and sync with QuickBooks for seamless financial management.</p>
            </div>
          </div>

          {/* Social Proof - Enhanced Stats Section */}
          <div className="mt-20 mb-8">
            <div className="text-center mb-8">
              <p className="text-blue-300 text-sm font-medium tracking-wider uppercase mb-2">
                Trusted by Growing Contractors
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-black">2x</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Faster Job Completion</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">AI-driven scheduling lets teams finish jobs in half the time</p>
                </div>
              </div>
              
              <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-white">30%</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Reduced Drive Time</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">Smart route optimization cuts wasted miles and fuel costs</p>
                </div>
              </div>
              
              <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold text-white">95%</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Customer Satisfaction</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">Happy customers and more 5-star reviews on every job</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Demo Indicator */}
      {!user && (
        <button
          onClick={handleDemoLogin}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg shadow-lg font-semibold z-50 hover:brightness-110 transition"
        >
          🚀 Live Demo Available
        </button>
      )}
    </div>
  )
}