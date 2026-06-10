import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-12 h-12 animate-spin text-petrol-600" />
      <p className="text-sm text-anthracite-600">
        Einen Moment, wir melden Sie an …
      </p>
    </div>
  );
}
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
