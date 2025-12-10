import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './auth-context';
import Loading from '../components/loading';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

export default AuthGuard;

