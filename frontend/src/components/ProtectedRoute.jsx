import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--pg-bg)]">
        <div className="pg-overline pg-pulse-dot text-white/60">
          Authenticating
        </div>
      </div>
    );
  }
  if (!user || !user.id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
}
