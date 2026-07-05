import { Navigate, useLocation } from "react-router-dom";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import RouteLoading from "./RouteLoading";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
