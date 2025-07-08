'use client';

interface JobLocation {
  id: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  service: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  estimatedDuration: number;
}

interface GoogleMapProps {
  jobs: JobLocation[];
  onRouteOptimized?: (optimizedJobs: JobLocation[]) => void;
  centerLocation?: { lat: number; lng: number };
  height?: string;
  width?: string;
}

export default function GoogleMap({
  jobs = [],
  centerLocation = { lat: 32.7767, lng: -96.7970 },
  height = '400px',
  width = '100%'
}: GoogleMapProps) {

  return (
    <div 
      style={{ height, width, position: 'relative' }} 
      className="rounded-lg overflow-hidden shadow-lg border border-gray-300"
    >
      {/* Map Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #e0f2fe 100%)',
          backgroundImage: `
            linear-gradient(rgba(100,100,100,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,100,100,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '25px 25px'
        }}
      />

      {/* Title */}
      <div 
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 100
        }}
      >
        Dallas, TX • Route & Retain
      </div>

      {/* Job Marker 1 - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          width: '40px',
          height: '40px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 50
        }}
        title={jobs[0] ? `${jobs[0].customerName} - ${jobs[0].service}` : 'Job Location 1'}
      >
        1
      </div>

      {/* Job Marker 2 - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          right: '80px',
          width: '40px',
          height: '40px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 50
        }}
        title={jobs[1] ? `${jobs[1].customerName} - ${jobs[1].service}` : 'Job Location 2'}
      >
        2
      </div>

      {/* Job Marker 3 - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '60px',
          width: '40px',
          height: '40px',
          backgroundColor: '#6b7280',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 50
        }}
        title={jobs[2] ? `${jobs[2].customerName} - ${jobs[2].service}` : 'Job Location 3'}
      >
        3
      </div>

      {/* Job Marker 4 - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '80px',
          width: '40px',
          height: '40px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 50
        }}
        title={jobs[3] ? `${jobs[3].customerName} - ${jobs[3].service}` : 'Job Location 4'}
      >
        4
      </div>

      {/* Route Lines */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>
        
        {/* Route path connecting all points */}
        <polyline
          points="80,80 320,100 320,280 100,300"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray="8,4"
          markerEnd="url(#arrowhead)"
        />
      </svg>

      {/* Legend */}
      <div 
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px',
          zIndex: 100
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Route Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
          <span>In Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <span>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
          <span>High Priority</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '2px', backgroundColor: '#3b82f6' }}></div>
          <span>Optimized Route</span>
        </div>
      </div>

      {/* Info Panel */}
      <div 
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px',
          textAlign: 'center',
          zIndex: 100
        }}
      >
        <div>🗺️ Interactive Map</div>
        <div>Click markers for details</div>
      </div>

      {/* Job Details Panel */}
      <div 
        style={{
          position: 'absolute',
          top: '50px',
          right: '8px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '11px',
          maxWidth: '200px',
          zIndex: 100
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Job Summary</div>
        {jobs.slice(0, 4).map((job, index) => (
          <div key={job.id} style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%',
              backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#ef4444' : index === 2 ? '#6b7280' : '#10b981',
              color: 'white',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{job.customerName}</div>
              <div style={{ color: '#666' }}>{job.service}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}