import { Navigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = user?.role;

    const hasRole = rolesArray.some(
      (role) => role.toLowerCase() === userRole?.toLowerCase(),
    );

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
