'use client';

import { useSession } from '@/lib/auth/auth-client';
import { AdminRole, Permission, hasAnyPermission, hasRoleAccess, normalizeAdminRole } from '@/lib/auth/rbac';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AdminRole;
  requiredPermission?: Permission | Permission[];
}

export function ProtectedRoute({ children, requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { data: session, isPending: loading } = useSession();
  const router = useRouter();
  const userRole = normalizeAdminRole((session?.user as any)?.role);
  const isAdminUser = userRole !== null;
  const permissionRequirements = useMemo(() => (
    requiredPermission
      ? (Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission])
      : []
  ), [requiredPermission]);

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.push('/admin/login');
      return;
    }

    if (!isAdminUser) {
      router.replace('/admin/login?error=storefront-only');
      return;
    }

    const hasRoleGate = requiredRole ? hasRoleAccess(userRole, [requiredRole]) : true;
    const hasPermissionGate = permissionRequirements.length > 0
      ? hasAnyPermission(userRole, permissionRequirements)
      : true;
    const hasAccess = hasRoleGate && hasPermissionGate;

    if (!hasAccess) {
      // If user doesn't have required role, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [session, loading, router, requiredRole, userRole, permissionRequirements, isAdminUser]);

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

  if (!isAdminUser) {
    return null;
  }

  const hasRoleGate = requiredRole ? hasRoleAccess(userRole, [requiredRole]) : true;
  const hasPermissionGate = permissionRequirements.length > 0
    ? hasAnyPermission(userRole, permissionRequirements)
    : true;
  const hasAccess = hasRoleGate && hasPermissionGate;

  if (!hasAccess) {
    return null;
  }


  return <>{children}</>;
}
