import { useCallback, useEffect, useState } from "react";

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
};

const supportsGeolocation =
  typeof navigator !== "undefined" && Boolean(navigator.geolocation);

export function useGeolocation(options = DEFAULT_OPTIONS) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(
    supportsGeolocation ? null : "Tu navegador no soporta geolocalización.",
  );
  const [isLoading, setIsLoading] = useState(supportsGeolocation);

  useEffect(() => {
    if (!supportsGeolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (positionError) => {
        setError(positionError.message || "No se pudo obtener tu ubicación.");
        setIsLoading(false);
      },
      options,
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  const refresh = useCallback(() => {
    if (!supportsGeolocation) return;

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (positionError) => {
        setError(positionError.message || "No se pudo obtener tu ubicación.");
        setIsLoading(false);
      },
      options,
    );
  }, [options]);

  return { coords, error, isLoading, refresh };
}
