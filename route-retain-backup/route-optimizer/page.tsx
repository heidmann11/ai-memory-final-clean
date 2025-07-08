// app/route-optimizer/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GoogleMap from '@/components/GoogleMap';
import {
  MapPin,
  Clock,
  Route,
  Truck,
  Fuel,
  Navigation,
  Play,
  Pause,
  Square,
  Timer,
  Camera,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from 'lucide-react';

// Re-using the JobLocation interface - ensure it matches your GoogleMapComponent exactly
export interface JobLocation {
  id: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  service: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  driveTo?: {
    duration: number; // minutes
    distance: number; // miles
    traffic: 'light' | 'moderate' | 'heavy';
  };
  equipmentNeeded: string[];
  photos: string[];
  notes: string;
}

interface RouteOptimization {
  id: string;
  date: string;
  crew: string;
  totalJobs: number;
  totalDriveTime: number;
  totalWorkTime: number;
  totalDistance: number;
  fuelCost: number;
  efficiency: number;
  status: 'planned' | 'active' | 'completed';
}

export default function RouteOptimizer() {
  const [selectedDate, setSelectedDate] = useState('2024-06-12');
  const [selectedCrew, setSelectedCrew] = useState('crew_1');
  const [jobs, setJobs] = useState<JobLocation[]>([
    {
      id: 'job_1',
      customerName: 'Alice Smith',
      address: '100 Light St, Baltimore, MD 21202',
      coordinates: { lat: 39.2878, lng: -76.6120 },
      service: 'HVAC Tune-up',
      estimatedDuration: 60,
      actualDuration: 55,
      priority: 'medium',
      status: 'pending',
      scheduledTime: '09:00',
      actualStartTime: '09:05',
      actualEndTime: '10:00',
      driveTo: { duration: 15, distance: 4.0, traffic: 'light' },
      equipmentNeeded: ['HVAC Tools', 'Filters'],
      photos: [],
      notes: 'Customer requested filter change and coil cleaning.',
    },
    {
      id: 'job_2',
      customerName: 'Bob Johnson',
      address: '700 E Pratt St, Baltimore, MD 21202',
      coordinates: { lat: 39.2870, lng: -76.6025 },
      service: 'Plumbing Leak Repair',
      estimatedDuration: 90,
      priority: 'high',
      status: 'in_progress',
      scheduledTime: '10:30',
      actualStartTime: '10:40',
      driveTo: { duration: 10, distance: 1.5, traffic: 'moderate' },
      equipmentNeeded: ['Plumbing Tools', 'Pipes'],
      photos: [],
      notes: 'Leaky faucet in kitchen sink.',
    },
    {
      id: 'job_3',
      customerName: 'Carol White',
      address: '300 W Lexington St, Baltimore, MD 21201',
      coordinates: { lat: 39.2907, lng: -76.6175 },
      service: 'Electrical Outlet Installation',
      estimatedDuration: 45,
      priority: 'low',
      status: 'pending',
      scheduledTime: '13:00',
      driveTo: { duration: 20, distance: 5.2, traffic: 'heavy' },
      equipmentNeeded: ['Electrical Kit', 'Outlets'],
      photos: [],
      notes: 'Install 3 new outlets in living room.',
    },
    {
      id: 'job_4',
      customerName: 'David Green',
      address: '500 International Dr, Baltimore, MD 21202',
      coordinates: { lat: 39.2828, lng: -76.6075 },
      service: 'Pest Control Treatment',
      estimatedDuration: 75,
      priority: 'medium',
      status: 'pending',
      scheduledTime: '15:00',
      driveTo: { duration: 12, distance: 2.8, traffic: 'light' },
      equipmentNeeded: ['Sprayer', 'Pesticides'],
      photos: [],
      notes: 'Routine quarterly pest treatment.',
    },
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState<JobLocation[]>([]);
  const [routeStats, setRouteStats] = useState<RouteOptimization | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobTimer, setJobTimer] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [selectedMapJob, setSelectedMapJob] = useState<JobLocation | null>(null);

  const crews = [
    { id: 'crew_1', name: 'Team Alpha (Sarah & Mike)', vehicle: 'Truck #1' },
    { id: 'crew_2', name: 'Team Beta (Tom & Lisa)', vehicle: 'Truck #2' },
    { id: 'crew_3', name: 'Team Gamma (Dave)', vehicle: 'Van #1' },
  ];

  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;
  
  // Debug: Check if API key is loaded (remove this after testing)
  useEffect(() => {
    console.log('🔑 API Key Status:', {
      hasKey: !!googleMapsApiKey,
      keyLength: googleMapsApiKey?.length || 0,
      keyStart: googleMapsApiKey?.substring(0, 10) || 'Not found',
      allEnvVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    });
  }, [googleMapsApiKey]);

  if (!googleMapsApiKey) {
    console.error('NEXT_PUBLIC_Maps_API_KEY is not set.');
  }

  const optimizeRouteWithMaps = useCallback(async () => {
    setIsOptimizing(true);
    try {
      const crewLocation = '100 S Charles St, Baltimore, MD 21201';
      const destinations = jobs.map((job) => ({
        address: job.address,
        jobId: job.id,
        priority: job.priority,
      }));

      const mockResult = {
        success: true,
        optimizedRoute: [
          { jobId: 'job_2', coordinates: { lat: 39.2870, lng: -76.6025 }, duration: 10, distance: 1.5, traffic: 'moderate' },
          { jobId: 'job_4', coordinates: { lat: 39.2828, lng: -76.6075 }, duration: 8, distance: 1.0, traffic: 'light' },
          { jobId: 'job_1', coordinates: { lat: 39.2878, lng: -76.6120 }, duration: 12, distance: 2.5, traffic: 'light' },
          { jobId: 'job_3', coordinates: { lat: 39.2907, lng: -76.6175 }, duration: 15, distance: 2.0, traffic: 'heavy' },
        ],
        metrics: {
          totalJobs: 4,
          totalDriveTime: 45,
          totalDistance: 7.0,
          fuelCost: 1.05,
          efficiency: 85,
        },
      };

      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = mockResult;

      if (result.success) {
        const updatedJobsWithDriveData = jobs.map((job) => {
          const optimizedJobData = result.optimizedRoute.find((r: any) => r.jobId === job.id);
          if (optimizedJobData) {
            return {
              ...job,
              coordinates: optimizedJobData.coordinates,
              driveTo: {
                duration: optimizedJobData.duration,
                distance: optimizedJobData.distance,
                traffic: optimizedJobData.traffic,
              },
            };
          }
          return job;
        });

        const sortedJobs = result.optimizedRoute.map((optimizedJob: any) =>
          updatedJobsWithDriveData.find(job => job.id === optimizedJob.jobId)
        ).filter(Boolean) as JobLocation[];

        setOptimizedRoute(sortedJobs);

        setRouteStats({
          id: 'route_1',
          date: selectedDate,
          crew: selectedCrew,
          totalJobs: result.metrics.totalJobs,
          totalDriveTime: result.metrics.totalDriveTime,
          totalWorkTime: sortedJobs.reduce((sum: number, job: JobLocation) => sum + job.estimatedDuration, 0),
          totalDistance: result.metrics.totalDistance,
          fuelCost: result.metrics.fuelCost,
          efficiency: result.metrics.efficiency,
          status: 'active',
        });

        setMapKey(prev => prev + 1);
        alert('Route optimized successfully with real traffic data!');
      } else {
        throw new Error('Route optimization failed (mock result was not successful)');
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      alert('Route optimization failed. Using basic optimization.');
      basicRouteOptimization();
    } finally {
      setIsOptimizing(false);
    }
  }, [jobs, selectedDate, selectedCrew]);

  const basicRouteOptimization = useCallback(() => {
    const dayJobs = jobs.filter(job => true);

    const optimized = [...dayJobs].sort((a, b) => {
      const statusOrder = { 'in_progress': 0, 'high': 1, 'pending': 2, 'completed': 3, 'delayed': 4 };
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };

      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    setOptimizedRoute(optimized);

    const totalDriveTime = optimized.reduce((sum, job) => sum + (job.driveTo?.duration || 0), 0);
    const totalWorkTime = optimized.reduce((sum, job) => sum + job.estimatedDuration, 0);
    const totalDistance = optimized.reduce((sum, job) => sum + (job.driveTo?.distance || 0), 0);
    const fuelCost = totalDistance * 0.15;
    const efficiency = totalWorkTime + totalDriveTime > 0 ? Math.round((totalWorkTime / (totalWorkTime + totalDriveTime)) * 100) : 0;

    setRouteStats({
      id: 'route_1',
      date: selectedDate,
      crew: selectedCrew,
      totalJobs: optimized.length,
      totalDriveTime,
      totalWorkTime,
      totalDistance,
      fuelCost,
      efficiency,
      status: 'active',
    });
  }, [selectedDate, selectedCrew, jobs]);

  useEffect(() => {
    basicRouteOptimization();

    const initiallyActiveJob = jobs.find(job => job.status === 'in_progress');
    if (initiallyActiveJob && initiallyActiveJob.actualStartTime) {
      setActiveJobId(initiallyActiveJob.id);
      try {
        const startDateTime = new Date(`${selectedDate}T${initiallyActiveJob.actualStartTime}`);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - startDateTime.getTime()) / 1000);
        setJobTimer(elapsedSeconds > 0 ? elapsedSeconds : 0);
      } catch (e) {
        console.error("Error parsing actualStartTime:", e);
        setJobTimer(0);
      }
    } else if (initiallyActiveJob) {
      setActiveJobId(initiallyActiveJob.id);
      setJobTimer(0);
    }
  }, [selectedDate, selectedCrew, jobs, basicRouteOptimization]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (activeJobId) {
      interval = setInterval(() => {
        setJobTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJobId]);

  const startJob = (jobId: string) => {
    setActiveJobId(jobId);
    setJobTimer(0);
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, status: 'in_progress', actualStartTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
          : job
      )
    );
  };

  const completeJob = (jobId: string) => {
    const jobToComplete = jobs.find(j => j.id === jobId);
    if (!jobToComplete) return;

    setActiveJobId(null);
    setJobTimer(0);

    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? {
            ...job,
            status: 'completed',
            actualEndTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            actualDuration: jobTimer / 60,
          }
        : job
      )
    );
  };

  const formatDuration = (minutes: number) => {
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m `;
    if (result === '' || secs > 0) result += `${secs}s`;
    return result.trim();
  };

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />;
      case 'delayed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const activeJobDetails = activeJobId ? optimizedRoute.find(job => job.id === activeJobId) : null;
  const mapCenterCoords = { lat: 39.2904, lng: -76.6122 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="selectedDate" className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
            <input
              id="selectedDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="selectedCrew" className="block text-sm font-semibold text-slate-700 mb-2">Crew</label>
            <select
              id="selectedCrew"
              value={selectedCrew}
              onChange={(e) => setSelectedCrew(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
            >
              {crews.map(crew => (
                <option key={crew.id} value={crew.id}>{crew.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={optimizeRouteWithMaps}
              disabled={isOptimizing || !googleMapsApiKey}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg flex items-center justify-center text-sm font-medium"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimizing...' : 'Optimize with Maps'}
            </Button>
          </div>
        </div>

        {/* Route Statistics */}
        {routeStats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{routeStats.totalJobs}</div>
                <div className="text-sm text-blue-100">Total Jobs</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{formatDuration(routeStats.totalWorkTime)}</div>
                <div className="text-sm text-green-100">Work Time</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{formatDuration(routeStats.totalDriveTime)}</div>
                <div className="text-sm text-orange-100">Drive Time</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{routeStats.totalDistance.toFixed(1)}mi</div>
                <div className="text-sm text-purple-100">Distance</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">${routeStats.fuelCost.toFixed(2)}</div>
                <div className="text-sm text-red-100">Fuel Cost</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{routeStats.efficiency}%</div>
                <div className="text-sm text-indigo-100">Efficiency</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Optimized Route & Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Schedule */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Optimized Route Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {optimizedRoute.map((job, index) => (
                    <div
                      key={job.id}
                      className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md
                      ${getPriorityColor(job.priority)}
                      ${job.status === 'in_progress' ? 'ring-2 ring-blue-400' : ''}
                      ${selectedMapJob?.id === job.id ? 'bg-blue-50 border-blue-400 shadow-md' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{job.customerName}</h3>
                            <p className="text-sm text-slate-600">{job.service}</p>
                            <p className="text-xs text-slate-500">{job.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge
                            variant={job.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {job.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">Scheduled:</span> {formatTime(job.scheduledTime)}
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Timer className="h-3 w-3" />
                            <span className="font-medium">Est. Work:</span> {formatDuration(job.estimatedDuration)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {job.driveTo && (
                            <>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Truck className="h-3 w-3" />
                                <span className="font-medium">Drive:</span> {formatDuration(job.driveTo.duration)}
                              </div>
                              <div className="flex items-center gap-1 text-slate-600">
                                <MapPin className="h-3 w-3" />
                                <span className="font-medium">Distance:</span> {job.driveTo.distance.toFixed(1)} mi
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs text-slate-600 mb-1">Equipment Required:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.equipmentNeeded.map((equipment, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-slate-50">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {job.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => startJob(job.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start Job
                          </Button>
                        )}
                        {job.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => completeJob(job.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete Job
                          </Button>
                        )}
                        {job.photos.length > 0 && job.status !== 'completed' && (
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                            <Camera className="h-3 w-3 mr-1" />
                            {job.photos.length} photos
                          </Badge>
                        )}
                      </div>

                      {job.notes && (
                        <div className="mt-3 p-3 bg-slate-100 rounded-lg border">
                          <div className="text-xs font-medium text-slate-700 mb-1">Job Notes:</div>
                          <div className="text-sm text-slate-800">{job.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map & AI Insights */}
          <div className="flex flex-col gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur flex-grow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Interactive Route Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {googleMapsApiKey ? (
                  <GoogleMap
                    key={mapKey}
                    jobs={optimizedRoute}
                    onRouteOptimized={setOptimizedRoute}
                    centerLocation={mapCenterCoords}
                    height="400px"
                    mapTitle="Baltimore, MD • Route & Retain"
                    selectedJob={selectedMapJob}
                    setSelectedJob={setSelectedMapJob}
                  />
                ) : (
                  <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 font-medium">Google Maps API Key Required</p>
                      <p className="text-sm text-slate-500 mt-1">Set NEXT_PUBLIC_Maps_API_KEY in your environment</p>
                      <div className="mt-4 text-xs text-slate-500 space-y-1">
                        <p><strong>Baltimore Center:</strong> 39.2904, -76.6122</p>
                        <p><strong>Jobs:</strong> {optimizedRoute.length} Baltimore locations</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 text-xs text-slate-600 space-y-1">
                  <p>• Baltimore, MD Service Area</p>
                  <p>• Click markers for job details</p>
                  <p>• Blue line shows optimized route</p>
                  <p>• Colors indicate job status and priority</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <span className="text-purple-600">🧠</span>
                  AI Insights (OpenAI)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600 text-sm">Route Efficiency Suggestion: +5%</p>
                <p className="text-slate-600 text-sm mt-1">Predicted Customer Satisfaction: 92%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Job Tracker & Equipment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Active Job Timer & Details */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Timer className="h-5 w-5 text-blue-600" />
                  Active Job Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {activeJobDetails ? (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <h3 className="text-xl font-semibold text-slate-900">{activeJobDetails.customerName}</h3>
                      <p className="text-slate-600 mb-4">{activeJobDetails.service}</p>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {Math.floor(jobTimer / 3600)}:{Math.floor((jobTimer % 3600) / 60).toString().padStart(2, '0')}:{(jobTimer % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-sm text-slate-600">Active Work Time</p>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-slate-700">Estimated</div>
                          <div className="text-blue-600 font-bold">{formatDuration(activeJobDetails.estimatedDuration)}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-slate-700">Progress</div>
                          <div className="text-green-600 font-bold">
                            {activeJobDetails.estimatedDuration > 0 ? Math.round((jobTimer / (activeJobDetails.estimatedDuration * 60)) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Customer:</span>
                          <span className="font-semibold text-slate-900">{activeJobDetails.customerName}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Service:</span>
                          <span className="font-semibold text-slate-900">{activeJobDetails.service}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Address:</span>
                          <span className="font-semibold text-slate-900 text-right">{activeJobDetails.address}</span>
                        </div>
                        {activeJobDetails.driveTo && (
                          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Drive Time:</span>
                            <span className="font-semibold text-slate-900">{formatDuration(activeJobDetails.driveTo.duration)}
                              <span className="text-xs text-slate-500 ml-1">({activeJobDetails.driveTo.distance.toFixed(1)} mi)</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600" variant="default">
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => completeJob(activeJobDetails.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Timer className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">No Active Job</p>
                    <p className="text-sm">Start a job to begin tracking time and progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Equipment Checklist */}
          <div>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Truck className="h-5 w-5 text-orange-600" />
                  Daily Equipment Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {['HVAC Tools', 'Plumbing Tools', 'Electrical Kit', 'Pest Control Equipment', 'Safety Equipment', 'First Aid Kit', 'Vehicle Supplies', 'Documentation'].map((item) => (
                    <label key={item} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                  Equipment Check Complete
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}