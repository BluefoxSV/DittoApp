import { GUEST_ONLY_PATHS, PUBLIC_PATHS } from "../../utils/authRoutes";
import GuestRoute from "./GuestRoute";
import HomeRoute from "./HomeRoute";
import ProtectedRoute from "./ProtectedRoute";

export default function GuardedRoute({ path, element }) {
  if (path === "/") {
    return <HomeRoute>{element}</HomeRoute>;
  }

  if (GUEST_ONLY_PATHS.includes(path)) {
    return <GuestRoute>{element}</GuestRoute>;
  }

  if (PUBLIC_PATHS.includes(path)) {
    return element;
  }

  return <ProtectedRoute>{element}</ProtectedRoute>;
}
