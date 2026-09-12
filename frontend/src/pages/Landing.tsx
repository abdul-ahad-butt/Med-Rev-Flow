import { Navigate } from 'react-router-dom';

export function LandingPage() {
  // Simple redirect to login or dashboard.
  return <Navigate to="/app" replace />;
}
