'use client';
import type { JobLocation } from '@/app/jobs/page'; // Reuse your JobLocation type

interface JobSummaryListProps {
  jobs: JobLocation[];
}

export default function JobSummaryList({ jobs }: JobSummaryListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <p className="font-bold">No Jobs Found</p>
        <p className="text-sm text-gray-500">Add a new job to see it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-2">Job Summary</h3>
      <ul className="space-y-2">
        {jobs.map(job => (
          <li key={job.id} className="text-sm p-2 rounded hover:bg-gray-100">
            <p className="font-semibold">{job.title}</p>
            <p className="text-gray-600">{job.customer_name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}