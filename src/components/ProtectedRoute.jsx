import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import CashPredixLogo from './CashPredixLogo';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/30 animate-pulse opacity-50 blur-lg"></div>
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center p-2.5 shadow-xl">
            <CashPredixLogo className="w-full h-full" glow />
          </div>
          <div className="absolute -bottom-2 -right-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-400 tracking-wide">
          Verifying CashPredix Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
