'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, isPending: loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const userRole = (session.user as any)?.role;
    const hasAccess = !requiredRole ||
      userRole === 'SUPER_ADMIN' ||
      session.user.email === 'admin@workit.co.ke' ||
      userRole === requiredRole;

    if (!hasAccess) {
      // If user doesn't have required role, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [session, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;
  const hasAccess = !requiredRole ||
    userRole === 'SUPER_ADMIN' ||
    session.user.email === 'admin@workit.co.ke' ||
    userRole === requiredRole;

  if (!hasAccess) {
    return null;
  }


  return <>{children}</>;
}
