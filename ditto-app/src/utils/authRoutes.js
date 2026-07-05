export const PUBLIC_PATHS = ["/", "/login", "/register"];

export const GUEST_ONLY_PATHS = ["/login", "/register"];

export const DASHBOARD_BY_ROLE = {
  worker: "/dashtrabaja",
  user: "/dashusu",
  support: "/dashusu",
};

export function getDashboardPath(role) {
  return DASHBOARD_BY_ROLE[role] ?? "/dashusu";
}
