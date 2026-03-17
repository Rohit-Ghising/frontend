import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAppSelector(s => s.auth);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
