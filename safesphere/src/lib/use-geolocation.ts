"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoPoint } from "./types";

export type GeoStatus = "idle" | "locating" | "watching" | "error" | "unsupported";

function describeError(error: GeolocationPositionError | Error) {
  if ("code" in error) {
    if (error.code === error.PERMISSION_DENIED)
      return "Location permission was denied. Enable location for this site in your browser settings, or describe your location in words.";
    if (error.code === error.POSITION_UNAVAILABLE)
      return "Your device could not determine a location. Try moving near a window or turning on GPS/Wi-Fi.";
    if (error.code === error.TIMEOUT) return "Getting your location took too long. Try again.";
  }
  return error.message || "Location is unavailable.";
}

function toPoint(position: GeolocationPosition): GeoPoint {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: Math.round(position.coords.accuracy),
    timestamp: position.timestamp,
  };
}

const OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 };

/**
 * Real browser Geolocation API. Coordinates are held in memory only
 * (never persisted or sent to a server by this hook).
 */
export function useGeolocation() {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | "unknown">("unknown");
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const onChange = () => {
      if (permissionStatus && !cancelled) setPermission(permissionStatus.state);
    };
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        permissionStatus = result;
        setPermission(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener("change", onChange);
      if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current);
    };
  }, []);

  const locateOnce = useCallback((): Promise<GeoPoint | null> => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("This browser does not support location. Describe your location in words instead.");
      return Promise.resolve(null);
    }
    if (watchId.current === null) setStatus("locating");
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (result) => {
          const point = toPoint(result);
          setPosition(point);
          setStatus((current) => (current === "watching" ? current : "idle"));
          resolve(point);
        },
        (failure) => {
          setError(describeError(failure));
          setStatus((current) => (current === "watching" ? current : "error"));
          resolve(null);
        },
        OPTIONS,
      );
    });
  }, []);

  const startWatching = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setError("This browser does not support location. Describe your location in words instead.");
      return;
    }
    if (watchId.current !== null) return;
    setError(null);
    setStatus("locating");
    watchId.current = navigator.geolocation.watchPosition(
      (result) => {
        setPosition(toPoint(result));
        setStatus("watching");
        setError(null);
      },
      (failure) => {
        setError(describeError(failure));
        if (failure.code === failure.PERMISSION_DENIED && watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
          setStatus("error");
        }
      },
      OPTIONS,
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setStatus("idle");
  }, []);

  const clear = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setPosition(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { position, status, error, permission, locateOnce, startWatching, stopWatching, clear, watching: status === "watching" };
}

export type Geolocation = ReturnType<typeof useGeolocation>;
