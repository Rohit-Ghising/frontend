import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/useAppStore";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
