import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

const useGeolocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelledRef.current) setError('permission_denied');
          return;
        }

        // watchPositionAsync may take time to resolve; guard with cancelledRef
        const subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 0 },
          (pos) => {
            if (cancelledRef.current) return;
            const { latitude, longitude } = pos.coords;
            setLocation({ latitude, longitude });
          }
        );

        // If unmounted between await and now, immediately remove
        if (cancelledRef.current) {
          try { subscription.remove(); } catch (_) { /* ignore */ }
        } else {
          subRef.current = subscription;
        }
      } catch (e: any) {
        const msg = e?.message || String(e || 'unknown_error');
        if (!cancelledRef.current) setError(msg);
        try {
          // If subscription was partially created, try removing it
          if (subRef.current) subRef.current.remove();
        } catch (_) {
          // ignore
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
      try { if (subRef.current) subRef.current.remove(); } catch (_) { }
      subRef.current = null;
    };
  }, []);

  return { location, error };
};

export default useGeolocation;