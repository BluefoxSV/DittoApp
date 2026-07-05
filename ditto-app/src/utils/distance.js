export function formatDistanceKm(distanceKm) {
  if (distanceKm == null || Number.isNaN(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}
