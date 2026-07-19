import { Navigate } from 'react-router-dom';
import { isAdminUser, isManager, isSuperAdmin } from '../utils/sessionUser';

/** Default landing route after login or unknown app paths. */
export function AppHomeRedirect() {
  if (isSuperAdmin()) return <Navigate to="/platform" replace />;
  if (isAdminUser() || isManager()) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/assessments" replace />;
}
