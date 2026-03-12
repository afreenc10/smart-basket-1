// Mock geolocation data for testing
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

// Mock location database
const MOCK_LOCATIONS: GeoLocation[] = [
  {
    latitude: 28.6139,
    longitude: 77.2090,
    address: '123 Central Avenue, New Delhi',
    city: 'New Delhi',
    pincode: '110001',
    state: 'Delhi',
  },
  {
    latitude: 28.5244,
    longitude: 77.1855,
    address: '456 South Extension, New Delhi',
    city: 'New Delhi',
    pincode: '110048',
    state: 'Delhi',
  },
  {
    latitude: 19.0760,
    longitude: 72.8777,
    address: '789 Marine Drive, Mumbai',
    city: 'Mumbai',
    pincode: '400020',
    state: 'Maharashtra',
  },
  {
    latitude: 19.1136,
    longitude: 72.8697,
    address: '321 Bandra West, Mumbai',
    city: 'Bandra',
    pincode: '400050',
    state: 'Maharashtra',
  },
  {
    latitude: 13.0827,
    longitude: 80.2707,
    address: '654 Mount Road, Chennai',
    city: 'Chennai',
    pincode: '600002',
    state: 'Tamil Nadu',
  },
  {
    latitude: 12.9716,
    longitude: 77.5946,
    address: '987 Koramangala, Bangalore',
    city: 'Bangalore',
    pincode: '560034',
    state: 'Karnataka',
  },
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get user's current location using browser's geolocation API
 * Falls back to mock location if not available
 */
export const getUserLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback to random mock location
      resolve(getRandomMockLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find nearest mock location
        const nearest = getNearestLocation(latitude, longitude);
        resolve(nearest);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to random mock location
        resolve(getRandomMockLocation());
      }
    );
  });
};

/**
 * Get a random mock location
 */
export const getRandomMockLocation = (): GeoLocation => {
  return MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
};

/**
 * Find the nearest location from mock data
 */
export const getNearestLocation = (
  latitude: number,
  longitude: number
): GeoLocation => {
  let nearest = MOCK_LOCATIONS[0];
  let minDistance = calculateDistance(
    latitude,
    longitude,
    nearest.latitude,
    nearest.longitude
  );

  for (let i = 1; i < MOCK_LOCATIONS.length; i++) {
    const location = MOCK_LOCATIONS[i];
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return nearest;
};

/**
 * Get nearby locations within specified radius (in km)
 */
export const getNearbyLocations = (
  latitude: number,
  longitude: number,
  radiusKm: number = 50
): GeoLocation[] => {
  return MOCK_LOCATIONS.filter((location) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );
    return distance <= radiusKm;
  });
};

/**
 * Search locations by city
 */
export const searchLocationsByCity = (city: string): GeoLocation[] => {
  return MOCK_LOCATIONS.filter((location) =>
    location.city.toLowerCase().includes(city.toLowerCase())
  );
};

/**
 * Get all available locations
 */
export const getAllMockLocations = (): GeoLocation[] => {
  return MOCK_LOCATIONS;
};

/**
 * Mock location with random slight variations (for testing)
 */
export const getMockLocationWithNoise = (): GeoLocation => {
  const baseLocation = getRandomMockLocation();
  const latNoise = (Math.random() - 0.5) * 0.1; // ±0.05 degrees
  const lonNoise = (Math.random() - 0.5) * 0.1;

  return {
    ...baseLocation,
    latitude: baseLocation.latitude + latNoise,
    longitude: baseLocation.longitude + lonNoise,
  };
};
