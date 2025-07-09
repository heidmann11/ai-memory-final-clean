'use client';

import React, { useState } from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  Cloud, 
  Snowflake,
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function WeatherPage() {
  const [selectedLocation, setSelectedLocation] = useState('baltimore');

  // Mock weather data for different locations
  const weatherData = {
    baltimore: {
      location: 'Baltimore, MD',
      current: {
        temp: 72,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        humidity: 65,
        windSpeed: 8,
        visibility: 10,
        uvIndex: 6,
        feelsLike: 75
      },
      forecast: [
        { day: 'Today', high: 75, low: 62, condition: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 10 },
        { day: 'Tomorrow', high: 78, low: 65, condition: 'Sunny', icon: 'sun', precipitation: 0 },
        { day: 'Wednesday', high: 71, low: 59, condition: 'Light Rain', icon: 'cloud-rain', precipitation: 80 },
        { day: 'Thursday', high: 69, low: 57, condition: 'Cloudy', icon: 'cloud', precipitation: 20 },
        { day: 'Friday', high: 74, low: 61, condition: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 15 }
      ],
      workRecommendations: {
        todayRecommendation: 'Excellent for outdoor work',
        tomorrowRecommendation: 'Perfect conditions for all jobs',
        alerts: []
      }
    },
    dc: {
      location: 'Washington, DC',
      current: {
        temp: 76,
        condition: 'Sunny',
        icon: 'sun',
        humidity: 58,
        windSpeed: 12,
        visibility: 10,
        uvIndex: 8,
        feelsLike: 78
      },
      forecast: [
        { day: 'Today', high: 79, low: 68, condition: 'Sunny', icon: 'sun', precipitation: 0 },
        { day: 'Tomorrow', high: 82, low: 70, condition: 'Partly Cloudy', icon: 'cloud-sun', precipitation: 5 },
        { day: 'Wednesday', high: 75, low: 63, condition: 'Thunderstorms', icon: 'cloud-rain', precipitation: 90 },
        { day: 'Thursday', high: 73, low: 61, condition: 'Cloudy', icon: 'cloud', precipitation: 30 },
        { day: 'Friday', high: 77, low: 65, condition: 'Sunny', icon: 'sun', precipitation: 0 }
      ],
      workRecommendations: {
        todayRecommendation: 'Perfect for all outdoor work',
        tomorrowRecommendation: 'Good conditions, slight clouds',
        alerts: ['Thunderstorm Warning Wednesday']
      }
    }
  };

  const currentWeather = weatherData[selectedLocation as keyof typeof weatherData];

  const getWeatherIcon = (iconName: string, size: string = 'h-8 w-8') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'cloud-sun':
        return <CloudSun className={`${size} text-yellow-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${size} text-blue-500`} />;
      case 'cloud':
        return <Cloud className={`${size} text-gray-400`} />;
      case 'snow':
        return <Snowflake className={`${size} text-blue-200`} />;
      default:
        return <CloudSun className={`${size} text-gray-400`} />;
    }
  };

  const getWorkRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Perfect') || recommendation.includes('Excellent')) {
      return 'text-green-600 bg-green-100';
    } else if (recommendation.includes('Good') || recommendation.includes('Fair')) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Weather Center</h1>
              <p className="text-white/80">Current conditions and forecasts for your service areas</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="baltimore">Baltimore, MD</option>
                <option value="dc">Washington, DC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Current Weather Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {getWeatherIcon(currentWeather.current.icon, 'h-16 w-16')}
                <div>
                  <h2 className="text-4xl font-bold text-white">{currentWeather.current.temp}°F</h2>
                  <p className="text-white/80 text-lg">{currentWeather.current.condition}</p>
                  <p className="text-white/60 text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {currentWeather.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Feels like {currentWeather.current.feelsLike}°F</p>
              <p className="text-white/60 text-xs">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Humidity</p>
                <p className="text-2xl font-bold text-white">{currentWeather.current.humidity}%</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Wind Speed</p>
                <p className="text-2xl font-bold text-white">{currentWeather.current.windSpeed} mph</p>
              </div>
              <Wind className="h-8 w-8 text-gray-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Visibility</p>
                <p className="text-2xl font-bold text-white">{currentWeather.current.visibility} mi</p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">UV Index</p>
                <p className="text-2xl font-bold text-white">{currentWeather.current.uvIndex}</p>
              </div>
              <Sun className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Work Recommendations */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
            Work Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Today:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkRecommendationColor(currentWeather.workRecommendations.todayRecommendation)}`}>
                  {currentWeather.workRecommendations.todayRecommendation}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Tomorrow:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkRecommendationColor(currentWeather.workRecommendations.tomorrowRecommendation)}`}>
                  {currentWeather.workRecommendations.tomorrowRecommendation}
                </span>
              </div>
            </div>
            {currentWeather.workRecommendations.alerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                  Weather Alerts
                </h4>
                {currentWeather.workRecommendations.alerts.map((alert, index) => (
                  <div key={index} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-6">5-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {currentWeather.forecast.map((day, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <p className="text-white font-medium mb-2">{day.day}</p>
                <div className="flex justify-center mb-3">
                  {getWeatherIcon(day.icon, 'h-10 w-10')}
                </div>
                <p className="text-white text-lg font-semibold">{day.high}°</p>
                <p className="text-white/60 text-sm">{day.low}°</p>
                <p className="text-white/80 text-xs mt-2">{day.condition}</p>
                <div className="mt-2 flex items-center justify-center text-xs text-white/60">
                  <Droplets className="h-3 w-3 mr-1" />
                  {day.precipitation}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}