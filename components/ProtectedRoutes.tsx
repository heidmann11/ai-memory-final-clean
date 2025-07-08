'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not logged in
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);

  if (user === undefined) {
    // Still loading
    return <p className="text-center py-10 text-white">Loading...</p>;
  }

  return <>{children}</>;
}
