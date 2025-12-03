import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';

const useGeolocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      error => {
        setError(error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 0, interval: 5000, fastestInterval: 2000 }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, error };
};

export default useGeolocation;