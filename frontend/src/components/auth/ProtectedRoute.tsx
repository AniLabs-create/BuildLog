import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  /**
   * When true, users who haven't finished first-time onboarding
   * (profileSetupComplete === false) are redirected to /setup.
   * Used on all app routes EXCEPT /setup itself.
   */
  requireCompleteProfile?: boolean;
}

/**
 * ProtectedRoute Component
 *
 * Route guard that ensures only authenticated users can access child routes.
 * - Unauthenticated  -> redirect to /login
 * - Unfinished setup -> redirect to /setup (unless requireCompleteProfile is off)
 * While authentication state is verifying on initial load, a loading spinner is shown.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireCompleteProfile = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="font-mono text-xs text-zinc-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireCompleteProfile && !user?.profileSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
