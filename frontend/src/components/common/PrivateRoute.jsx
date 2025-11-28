import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
