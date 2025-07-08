// app/page.tsx
import Image from 'next/image'; // Assuming Image is used for logos within the main content
import Link from 'next/link'; // Assuming Link is used for CTAs

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/*
        THE NAVIGATION HEADER HAS BEEN REMOVED FROM HERE.
        It is now handled by the global app/layout.tsx file.
      */}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Only Platform <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Built for Contractors
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              AI-powered field service management that handles everything from customer calls to cash collection. 
              Replace 3-5 tools with one intelligent platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a 
              href="/jobs" 
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center justify-center">
                Get Started
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
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

          {/* Social Proof */}
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-8">
            <p className="text-blue-200 text-sm mb-4">Trusted by Growing Contractors</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2x</div>
                <div className="text-blue-200 text-sm">Faster Job Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">30%</div>
                <div className="text-blue-200 text-sm">Reduced Drive Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-blue-200 text-sm">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Demo Indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg shadow-lg">
          <span className="text-sm font-medium">🚀 Live Demo Available</span>
        </div>
      </div>
    </div>
  )
}