import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ roles = [] }) {
  const { user, accessToken } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect provider to their dashboard, admin to admin dashboard, etc.
    if (user.role === 'admin' || user.role === 'operations_manager' || user.role === 'support_agent') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'provider') {
      return <Navigate to="/provider/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
