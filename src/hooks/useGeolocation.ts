'use client';

import { useEffect, useRef, useState } from 'react';
import type { Coordinates } from '@/types';
import { TEOTIHUACAN_CENTER } from '@/lib/constants';

const IS_DEV = process.env.NODE_ENV === 'development';

interface GeolocationState {
  position: Coordinates | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
  isSimulated: boolean;
}

function getInitialState(): {
  error: string | null;
  position: Coordinates | null;
  accuracy: number | null;
  isTracking: boolean;
  isSimulated: boolean;
} {
  if (typeof navigator === 'undefined') {
    return { error: null, position: null, accuracy: null, isTracking: false, isSimulated: false };
  }
  if (!navigator.geolocation) {
    if (IS_DEV) {
      return {
        error: null,
        position: TEOTIHUACAN_CENTER,
        accuracy: 10,
        isTracking: true,
        isSimulated: true,
      };
    }
    return {
      error: 'Geolocation is not supported by this browser',
      position: null,
      accuracy: null,
      isTracking: false,
      isSimulated: false,
    };
  }
  return { error: null, position: null, accuracy: null, isTracking: false, isSimulated: false };
}

export function useGeolocation(): GeolocationState {
  const initial = getInitialState();
  const [position, setPosition] = useState<Coordinates | null>(initial.position);
  const [accuracy, setAccuracy] = useState<number | null>(initial.accuracy);
  const [error, setError] = useState<string | null>(initial.error);
  const [isTracking, setIsTracking] = useState(initial.isTracking);
  const [isSimulated, setIsSimulated] = useState(initial.isSimulated);
  const watchId = useRef<number | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    // In dev mode, set a fallback timer — if real geolocation doesn't
    // respond within 3s or errors out, use simulated coordinates.
    if (IS_DEV) {
      fallbackTimerRef.current = setTimeout(() => {
        setPosition((prev) => {
          if (prev) return prev;
          setIsSimulated(true);
          setIsTracking(true);
          setAccuracy(10);
          setError(null);
          return TEOTIHUACAN_CENTER;
        });
      }, 3000);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(pos.coords.accuracy);
        setError(null);
        setIsTracking(true);
        setIsSimulated(false);
      },
      (err) => {
        if (IS_DEV) {
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
          setPosition(TEOTIHUACAN_CENTER);
          setAccuracy(10);
          setError(null);
          setIsTracking(true);
          setIsSimulated(true);
        } else {
          setError(err.message);
          setIsTracking(false);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      },
    );

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  return { position, accuracy, error, isTracking, isSimulated };
}
