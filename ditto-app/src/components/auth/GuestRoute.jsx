import { Navigate } from "react-router-dom";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getDashboardPath } from "../../utils/authRoutes";
import RouteLoading from "./RouteLoading";

export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useCurrentUser();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}
