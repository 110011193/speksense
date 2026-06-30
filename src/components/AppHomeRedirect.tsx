import { Navigate } from 'react-router-dom';
import { isAdminUser } from '../utils/sessionUser';

/** Default landing route after login or unknown app paths. */
export function AppHomeRedirect() {
  return <Navigate to={isAdminUser() ? '/dashboard' : '/assessments'} replace />;
}
