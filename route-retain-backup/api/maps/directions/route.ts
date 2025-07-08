// app/api/maps/directions/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Destination {
  address: string;
  jobId: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizedStop {
  jobId: string;
  address: string;
  coordinates: { lat: number; lng: number };
  duration: number; // Drive time in minutes
  distance: number; // Distance in miles
  traffic: 'light' | 'moderate' | 'heavy';
  order: number;
}

interface OptimizationMetrics {
  totalJobs: number;
  totalDriveTime: number; // minutes
  totalDistance: number; // miles
  fuelCost: number; // dollars
  efficiency: number; // percentage
}

export async function POST(request: NextRequest) {
  try {
    const { origin, destinations } = await request.json();

    // CORRECTED: Use the standardized NEXT_PUBLIC_Maps_API_KEY
    const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY; 

    if (!apiKey) {
      console.error("Server-side error: Google Maps API Key not found in environment variables for Directions API.");
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Google Maps API Key missing' },
        { status: 500 }
      );
    }

    if (!origin || !destinations || destinations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Origin and destinations are required' },
        { status: 400 }
      );
    }

    // Step 1: Geocode all addresses to get coordinates
    // Using Promise.allSettled to allow some geocoding failures without stopping the whole process
    const geocodedDestinationsResults = await Promise.allSettled(
      destinations.map(async (dest: Destination) => {
        try {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dest.address)}&key=${apiKey}`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            return {
              ...dest,
              coordinates: { lat: location.lat, lng: location.lng },
              formattedAddress: geocodeData.results[0].formatted_address
            };
          } else {
            console.error(`Geocoding failed for ${dest.address}:`, geocodeData.status, geocodeData.error_message);
            throw new Error(`Geocoding failed: ${geocodeData.status}`); // Throw to be caught by Promise.allSettled
          }
        } catch (error) {
          console.error(`Error geocoding ${dest.address}:`, error);
          throw error; // Re-throw to be caught by Promise.allSettled
        }
      })
    );

    const validDestinations: (Destination & { coordinates: { lat: number; lng: number }; formattedAddress: string; })[] = 
      geocodedDestinationsResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<any>).value);

    if (validDestinations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not geocode any valid destinations' },
        { status: 400 }
      );
    }
    
    // Ensure the origin is also geocoded if it's an address string
    let originCoords;
    // Basic check: if origin is an object with lat/lng, use it. Otherwise, assume it's an address string.
    if (typeof origin === 'object' && origin.lat !== undefined && origin.lng !== undefined) {
        originCoords = origin;
    } else {
        try {
            const geocodeOriginResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin)}&key=${apiKey}`
            );
            const geocodeOriginData = await geocodeOriginResponse.json();
            if (geocodeOriginData.status === 'OK' && geocodeOriginData.results.length > 0) {
                originCoords = geocodeOriginData.results[0].geometry.location;
            } else {
                console.error(`Geocoding failed for origin: "${origin}". Status: ${geocodeOriginData.status}`);
                return NextResponse.json({ success: false, error: 'Could not geocode origin address' }, { status: 400 });
            }
        } catch (error) {
            console.error(`Error geocoding origin: "${origin}"`, error);
            return NextResponse.json({ success: false, error: 'Internal server error geocoding origin' }, { status: 500 });
        }
    }


    // Step 2: Get optimized route using Google Directions API
    const waypoints = validDestinations.map(dest => 
      `${dest.coordinates.lat},${dest.coordinates.lng}`
    ).join('|');

    const directionsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${originCoords.lat},${originCoords.lng}&` + // Use geocoded origin coordinates
      `destination=${originCoords.lat},${originCoords.lng}&` + // Return to origin
      `waypoints=optimize:true|${waypoints}&` +
      `mode=driving&` +
      `traffic_model=best_guess&` + // Request traffic data
      `departure_time=now&` + // Needed for traffic_model
      `key=${apiKey}` // Corrected API key access
    );

    const directionsData = await directionsResponse.json();

    if (directionsData.status !== 'OK') {
      console.error(`Directions API error for route: "${origin}" to "${validDestinations.map(d => d.address).join(', ')}":`, directionsData.status, directionsData.error_message);
      return NextResponse.json(
        { success: false, error: `Directions API error: ${directionsData.status}` },
        { status: 400 }
      );
    }

    // Ensure a route was actually returned
    if (!directionsData.routes || directionsData.routes.length === 0) {
        return NextResponse.json({ success: false, error: 'No routes found by Directions API' }, { status: 404 });
    }

    // Step 3: Process the optimized route
    const route = directionsData.routes[0];
    const waypointOrder = route.waypoint_order || []; // Order of waypoints as optimized by Google
    const legs = route.legs; // Array of legs: origin -> first waypoint -> ... -> last waypoint -> destination

    // Create optimized route with real data
    const optimizedRoute: OptimizedStop[] = waypointOrder.map((originalIndex: number, newIndex: number) => {
      const destination = validDestinations[originalIndex];
      const leg = legs[newIndex]; // Leg from previous stop to this one (after origin)

      // Calculate traffic level based on duration vs duration_in_traffic
      let traffic: 'light' | 'moderate' | 'heavy' = 'light';
      if (leg.duration_in_traffic && leg.duration) {
        const trafficRatio = leg.duration_in_traffic.value / leg.duration.value;
        if (trafficRatio > 1.3) traffic = 'heavy';
        else if (trafficRatio > 1.1) traffic = 'moderate';
      }

      return {
        jobId: destination.jobId,
        address: destination.formattedAddress || destination.address,
        coordinates: destination.coordinates,
        duration: Math.round(leg.duration.value / 60), // Convert seconds to minutes
        distance: Math.round((leg.distance.value / 1609.34) * 10) / 10, // Convert meters to miles (1 mile = 1609.34 meters)
        traffic,
        order: newIndex + 1
      };
    });

    // Handle the leg from the last waypoint to the final destination (origin) if it exists
    if (legs.length > waypointOrder.length) { // Means there's a final leg back to destination
        const finalLeg = legs[legs.length - 1]; // The very last leg
        const originAsFinalStop: OptimizedStop = {
            jobId: 'RETURN_TO_BASE', // Special ID for return trip
            address: origin.formattedAddress || origin, // Use formatted origin address if available
            coordinates: originCoords,
            duration: Math.round(finalLeg.duration.value / 60),
            distance: Math.round((finalLeg.distance.value / 1609.34) * 10) / 10,
            traffic: 'light', // Recalculate traffic if needed for final leg
            order: optimizedRoute.length + 1
        };
        optimizedRoute.push(originAsFinalStop);
    }


    // Step 4: Calculate metrics
    const totalDistance = optimizedRoute.reduce((sum, stop) => sum + stop.distance, 0);
    const totalDriveTime = optimizedRoute.reduce((sum, stop) => sum + stop.duration, 0);
    const fuelCost = totalDistance * 0.15; // $0.15 per mile estimate (example)
    
    // Efficiency calculation: (total work time) / (total work time + total drive time)
    const estimatedWorkTime = validDestinations.length * 45; // Assuming 45 minutes average work time per job
    const efficiency = Math.round((estimatedWorkTime / (estimatedWorkTime + totalDriveTime)) * 100);

    const metrics: OptimizationMetrics = {
      totalJobs: validDestinations.length,
      totalDriveTime,
      totalDistance: Math.round(totalDistance * 10) / 10,
      fuelCost: Math.round(fuelCost * 100) / 100, // Round to 2 decimal places
      efficiency: Math.max(0, Math.min(100, efficiency)) // Cap efficiency between 0-100
    };

    // Step 5: Enhanced optimization based on priority
    // Note: Google's 'optimize:true' does distance optimization.
    // This custom function reorders based on priority *after* Google's optimization.
    const finalOptimizedRoute = optimizeByPriority(optimizedRoute, destinations);

    return NextResponse.json({
      success: true,
      optimizedRoute: finalOptimizedRoute,
      metrics,
      rawDirectionsData: { // Include raw data for debugging/more advanced rendering if needed
        distance: route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0),
        duration: route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0),
        waypointOrder
      }
    });

  } catch (error) {
    console.error('Route optimization API caught unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during route optimization' },
      { status: 500 }
    );
  }
}

// Helper function to reorder jobs based on priority
function optimizeByPriority(route: OptimizedStop[], originalDestinations: Destination[]): OptimizedStop[] {
  // Create a map of jobId to priority
  const priorityMap = new Map<string, string>();
  originalDestinations.forEach(dest => {
    priorityMap.set(dest.jobId, dest.priority);
  });

  // Sort route with priority consideration
  // High priority jobs should be earlier in the route
  const priorityOrder: { [key: string]: number } = { 'high': 0, 'medium': 1, 'low': 2 };
  
  const priorityWeightedRoute = [...route].sort((a, b) => {
    // Handle the special 'RETURN_TO_BASE' job to keep it at the end
    if (a.jobId === 'RETURN_TO_BASE') return 1;
    if (b.jobId === 'RETURN_TO_BASE') return -1;

    const priorityA = priorityMap.get(a.jobId);
    const priorityB = priorityMap.get(b.jobId);
    
    // Default to a lower priority number (higher actual priority) if not found, to push unknowns earlier
    const orderA = priorityOrder[priorityA as keyof typeof priorityOrder] ?? 3;
    const orderB = priorityOrder[priorityB as keyof typeof priorityOrder] ?? 3;
    
    // If priorities are different, prioritize higher priority
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If priorities are the same, maintain original distance optimization order
    return a.order - b.order;
  });

  // Update order numbers to reflect the new priority-weighted order
  return priorityWeightedRoute.map((stop, index) => ({
    ...stop,
    order: index + 1
  }));
}

// GET endpoint for testing API route recognition
export async function GET() {
  return NextResponse.json({
    message: 'Google Maps Directions API endpoint is running',
    endpoints: {
      POST: '/api/maps/directions - Optimize route with origin and destinations'
    }
  });
}