// app/(no-layout)/weather/page.tsx
'use client'; // *** CRITICAL: Must be the very first line if using React hooks like useState/useEffect ***

import React, { useState, useCallback, useEffect } from 'react'; // *** CRITICAL: Ensure React is imported ***
import { CloudSun, CloudRain, Thermometer, Wind, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Make sure Badge is accessible
import Image from 'next/image'; // For logo
import Link from 'next/link'; // For navigation links
import { LayoutDashboard, MessageSquare, Route, Camera, Home as HomeIcon, CloudSun as CloudSunIcon } from 'lucide-react'; // Example icons for navigation

export default function WeatherPage() { // *** CRITICAL: Must be 'export default function ComponentName()' ***
  const [location, setLocation] = useState('Baltimore, MD'); // Default to Baltimore
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock weather data based on location (this will be replaced by API call later)
  const fetchWeatherData = async (loc: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (loc.toLowerCase().includes('baltimore')) {
      setWeatherData({
        current: {
          temp: 72,
          condition: 'Partly Cloudy',
          icon: 'cloud-sun',
          windSpeed: 10,
          humidity: 65
        },
        forecast: [
          { day: 'Today', tempHigh: 75, tempLow: 60, condition: 'Partly Cloudy', icon: 'cloud-sun' },
          { day: 'Tomorrow', tempHigh: 70, tempLow: 58, condition: 'Light Rain', icon: 'cloud-rain' },
          { day: 'Friday', tempHigh: 78, tempLow: 62, condition: 'Sunny', icon: 'sun' }
        ]
      });
    } else if (loc.toLowerCase().includes('dallas')) {
        setWeatherData({
            current: {
                temp: 88,
                condition: 'Sunny',
                icon: 'sun',
                windSpeed: 15,
                humidity: 40
            },
            forecast: [
                { day: 'Today', tempHigh: 90, tempLow: 75, condition: 'Sunny', icon: 'sun' },
                { day: 'Tomorrow', tempHigh: 85, tempLow: 70, condition: 'Mostly Sunny', icon: 'cloud-sun' },
                { day: 'Friday', tempHigh: 92, tempLow: 78, condition: 'Hot', icon: 'sun' }
            ]
        });
    }
    else {
      setError('Location not found in mock data. Try Baltimore, MD or Dallas, TX.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const getWeatherIcon = (iconName: string, size: string = 'h-10 w-10') => {
    switch (iconName) {
      case 'cloud-sun': return <CloudSun className={`${size} text-yellow-500`} />;
      case 'cloud-rain': return <CloudRain className={`${size} text-blue-500`} />;
      case 'sun': return <CloudSun className={`${size} text-orange-400`} />; // Using cloud-sun for sun icon temporarily
      default: return <CloudSun className={`${size} text-gray-400`} />;
    }
  };

  return (
    // This page's content starts with its OWN header, as it opts out of the global one.
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-50">
      {/* --- WEATHER PAGE'S OWN HEADER (Dashboard button removed) --- */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left side: Route & Retain Logo + Weather Intelligence Title */}
          <div className="flex items-center space-x-6">
            {/* corval.ai Logo + Route & Retain Orange Logo */}
            <div className="flex items-center space-x-3">
              <Image
                src="/corvallogo.png" // Adjust path if needed
                alt="Corval.ai Logo"
                width={100}
                height={30}
                priority
                className="object-contain"
              />
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Route & Retain
                </h1>
              </div>
            </div>

            {/* Page Title/Tagline for Weather Intelligence */}
            <div className="hidden md:block border-l border-slate-200 pl-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                  <CloudSunIcon className="h-6 w-6 text-white" /> {/* Using CloudSunIcon from lucide-react */}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Weather Intelligence</h2>
                  <p className="text-slate-600">Smart scheduling based on weather conditions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Navigation Links (Dashboard removed) */}
          <nav className="flex items-center space-x-4">
            <Link href="/jobs" className="text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              Jobs
            </Link>
            <Link href="/sms" className="text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              SMS Center
            </Link>
            <Link href="/route-optimizer" className="text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              Routes
            </Link>
            <Link href="/photos" className="text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-100">
              Photos
            </Link>
            <Link href="/weather" className="text-blue-600 font-medium px-3 py-2 rounded-lg bg-blue-100"> {/* Highlight current page */}
              Weather
            </Link>
            {/* Action Buttons/Badges for this header */}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Refresh
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Weather Active
            </Badge>
          </nav>
        </div>
      </header>
      {/* --- END WEATHER PAGE'S OWN HEADER --- */}

      <div className="max-w-7xl mx-auto p-6"> {/* Main content wrapper */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Weather Forecast</h1> {/* Keep this title or remove if redundant with header's "Weather Intelligence" */}

        {/* Location Input */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Enter location (e.g., Baltimore, MD)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchWeatherData(location); }}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
          />
        </div>

        {loading && (
          <div className="text-center text-blue-600 text-lg">Loading weather...</div>
        )}

        {error && (
          <div className="text-center text-red-600 text-lg">{error}</div>
        )}

        {weatherData && !loading && !error && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            {/* Current Weather */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-4">
                {getWeatherIcon(weatherData.current.icon, 'h-16 w-16')}
                <div>
                  <p className="text-5xl font-bold text-gray-900">{weatherData.current.temp}°F</p>
                  <p className="text-lg text-gray-600">{weatherData.current.condition}</p>
                </div>
              </div>
              <div className="text-right text-gray-700">
                <p className="text-sm flex items-center gap-1"><Wind className="h-4 w-4"/> {weatherData.current.windSpeed} mph Wind</p>
                <p className="text-sm flex items-center gap-1"><Droplet className="h-4 w-4"/> {weatherData.current.humidity}% Humidity</p>
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {weatherData.forecast.map((day: any, index: number) => (
                <div key={index} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg font-semibold text-gray-800 mb-2">{day.day}</p>
                  {getWeatherIcon(day.icon)}
                  <p className="text-xl font-bold text-gray-900 mt-2">{day.tempHigh}° / {day.tempLow}°</p>
                  <p className="text-md text-gray-600">{day.condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}