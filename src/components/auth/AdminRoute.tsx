/**
 * Admin Route
 * Route guard that requires admin-level permissions.
 * Redirects to login if not authenticated, shows forbidden if insufficient permissions.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasPermission, PERMISSIONS } from '../../lib/authorization';
import { ROUTES } from '../../config/routes';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AdminRoute({ children, requiredPermission = PERMISSIONS.SYSTEM_ADMIN }: AdminRouteProps) {
  const { isAuthenticated, authContext, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!hasPermission(authContext, requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to access this area.
          </p>
          <Navigate to={ROUTES.HOME} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
