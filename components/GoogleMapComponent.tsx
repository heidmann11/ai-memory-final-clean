'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface Job {
  id: string;
  title: string;
  coordinates?: { lat: number; lng: number };
}

interface GoogleMapComponentProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
  apiKey: string;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

export default function GoogleMapComponent({
  jobs,
  onJobSelect,
  apiKey,
}: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'], // include if you want Geocoder, Autocomplete, etc.
  });

  if (loadError) {
    return <div className="text-red-400">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading map…</div>;
  }

  // Filter out any jobs without valid lat/lng
  const validJobs = jobs.filter(
    (j) =>
      j.coordinates != null &&
      typeof j.coordinates.lat === 'number' &&
      typeof j.coordinates.lng === 'number'
  );

  // Compute a sensible center
  const center =
    validJobs.length === 0
      ? defaultCenter
      : validJobs.length === 1
      ? validJobs[0].coordinates!
      : validJobs.reduce(
          (acc, { coordinates }) => {
            acc.lat += coordinates!.lat;
            acc.lng += coordinates!.lng;
            return acc;
          },
          { lat: 0, lng: 0 }
        );

  // If more than one, average them
  if (validJobs.length > 1) {
    center.lat /= validJobs.length;
    center.lng /= validJobs.length;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={9}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {validJobs.map((job, idx) => (
        <MarkerF
          key={job.id}
          position={job.coordinates!}
          label={{
            text: `${idx + 1}`,
            color: 'white',
            fontWeight: 'bold',
          }}
          onClick={() => onJobSelect(job)}
        />
      ))}
    </GoogleMap>
  );
}
