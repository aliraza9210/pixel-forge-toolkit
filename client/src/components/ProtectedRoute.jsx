import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <LoadingSkeleton className="w-48 h-6" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
