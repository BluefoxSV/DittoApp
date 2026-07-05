import { Navigate, useLocation } from "react-router-dom";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getDashboardPath } from "../../utils/authRoutes";
import RouteLoading from "./RouteLoading";

function getSafeRedirectPath(path) {
  if (typeof path !== "string") return "";
  if (!path.startsWith("/") || path.startsWith("//")) return "";

  return path;
}

export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useCurrentUser();
  const location = useLocation();
  const redirectTo = getSafeRedirectPath(location.state?.redirectTo);

  if (isLoading) {
    return <RouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo || getDashboardPath(user?.role)} replace />;
  }

  return children;
}
