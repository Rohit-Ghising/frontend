import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const location = useLocation();

  const paymentFlag = new URLSearchParams(location.search).get('payment')?.toLowerCase();
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const allowPaymentCallback = normalizedPath === '/checkout' && paymentFlag?.startsWith('esewa_');

  if (!isAuthenticated && !allowPaymentCallback) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
