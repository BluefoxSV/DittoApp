import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
};

const COORD_PRECISION = 4;

const supportsGeolocation =
  typeof navigator !== "undefined" && Boolean(navigator.geolocation);

function roundCoord(value) {
  return Number(value.toFixed(COORD_PRECISION));
}

function toStableCoords(latitude, longitude) {
  return {
    latitude: roundCoord(latitude),
    longitude: roundCoord(longitude),
  };
}

function coordsEqual(a, b) {
  if (!a || !b) return false;
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

export function useGeolocation(options = DEFAULT_OPTIONS) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(
    supportsGeolocation ? null : "Tu navegador no soporta geolocalización.",
  );
  const [isLoading, setIsLoading] = useState(false);
  const watchIdRef = useRef(null);
  const coordsRef = useRef(null);

  const applyPosition = useCallback((latitude, longitude) => {
    const next = toStableCoords(latitude, longitude);
    coordsRef.current = next;
    setCoords((prev) => (coordsEqual(prev, next) ? prev : next));
    setError(null);
    setIsLoading(false);
  }, []);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatch = useCallback(() => {
    if (!supportsGeolocation) return;

    stopWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        applyPosition(position.coords.latitude, position.coords.longitude);
      },
      (positionError) => {
        setError(positionError.message || "No se pudo obtener tu ubicación.");
        setIsLoading(false);
      },
      options,
    );
  }, [applyPosition, options, stopWatch]);

  const refresh = useCallback(() => {
    if (!supportsGeolocation) return;

    if (!coordsRef.current) {
      setIsLoading(true);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyPosition(position.coords.latitude, position.coords.longitude);
        startWatch();
      },
      (positionError) => {
        setError(positionError.message || "No se pudo obtener tu ubicación.");
        setIsLoading(false);
      },
      options,
    );
  }, [applyPosition, options, startWatch]);

  useEffect(() => () => stopWatch(), [stopWatch]);

  return { coords, error, isLoading, refresh };
}
