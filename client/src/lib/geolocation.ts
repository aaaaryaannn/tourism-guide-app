/**
 * Functions for geolocation and nearby place/guide calculations
 */

/**
 * Get user's current position (if permissions granted)
 * @returns Promise with position or error
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    // First check if we have permission
    navigator.permissions.query({ name: 'geolocation' as PermissionName })
      .then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          reject(new Error("Location permission denied. Please enable location access in your browser settings."));
          return;
        }

        // Get the position with high accuracy
    navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Location obtained successfully:", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            resolve(position);
          },
          (error) => {
            console.error("Error getting location:", error);
            let errorMessage = "Failed to get your location";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location access in your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
              default:
                errorMessage = "An unknown error occurred while getting your location.";
            }
            reject(new Error(errorMessage));
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
          }
    );
      })
      .catch(error => {
        console.error("Error checking geolocation permission:", error);
        reject(new Error("Failed to check location permission"));
      });
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Generate a random point within a given distance from a center point
 * @param centerLat - Latitude of center point
 * @param centerLng - Longitude of center point 
 * @param radiusKm - Radius in kilometers
 * @returns Object with latitude and longitude
 */
export function getRandomLocation(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): { lat: number; lng: number } {
  // Convert radius from kilometers to degrees (approximate)
  const radiusInDegrees = radiusKm / 111.32;
  
  // Generate random angle
  const randomAngle = Math.random() * Math.PI * 2;
  
  // Calculate displacement
  const randomRadius = Math.sqrt(Math.random()) * radiusInDegrees;
  
  // Convert back to latitude and longitude
  const latDisplacement = randomRadius * Math.cos(randomAngle);
  const lngDisplacement = randomRadius * Math.sin(randomAngle) / Math.cos(centerLat * (Math.PI / 180));
  
  // Return new position
  return {
    lat: centerLat + latDisplacement,
    lng: centerLng + lngDisplacement
  };
}

/**
 * Watchs the user's position and updates it
 * @param successCallback - Function to call when position is updated successfully
 * @param errorCallback - Function to call when there's an error
 * @returns Watchposition ID that can be used to clear the watch
 */
export function watchUserPosition(
  successCallback: (position: GeolocationPosition) => void,
  errorCallback: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    errorCallback({
      code: 2,
      message: "Geolocation is not supported by this browser.",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    });
    return 0;
  }
  
  return navigator.geolocation.watchPosition(
    successCallback,
    errorCallback,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

/**
 * Clear a position watch
 * @param watchId - The ID returned by watchUserPosition
 */
export function clearPositionWatch(watchId: number): void {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Format coordinates as a string
 * @param latitude - Latitude 
 * @param longitude - Longitude
 * @returns Formatted coordinates string
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/**
 * Updates user's location in the database
 * @param userId - User ID
 * @param latitude - Latitude as string
 * @param longitude - Longitude as string
 */
export async function updateUserLocation(
  userId: number,
  latitude: string,
  longitude: string
): Promise<void> {
  try {
    const response = await fetch('/api/user/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        latitude,
        longitude
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update location');
    }
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}