import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.locatecontrol/dist/L.Control.Locate.css";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import fixLeafletMapErrors from "../lib/leaflet-fix";

// Import the CSS file dynamically
import("leaflet.locatecontrol/dist/L.Control.Locate.min.css").catch(err => {
  console.warn("Failed to load leaflet.locatecontrol CSS:", err);
});

// Define the types for the marker position
export interface LatLng {
  lat: number;
  lng: number;
}

// Define MarkerType enum for different marker icons
export type MarkerType = 'attraction' | 'guide' | 'user' | 'poi';

export interface IMarker {
  id?: string | number;
  position: LatLng;
  title?: string;
  popup?: string;
  customIcon?: boolean;
  markerType?: MarkerType;
}

// Props interface for MapView component
interface MapViewProps {
  center?: LatLng;
  zoom?: number;
  markers?: IMarker[];
  onMapClick?: (latlng: LatLng) => void;
  onMarkerClick?: (marker: IMarker) => void;
  bottomSheetOpen?: boolean;
  onBottomSheetOpenChange?: (isOpen: boolean) => void;
  bottomSheetContent?: React.ReactNode;
  className?: string;
  enableDragging?: boolean;
}

// Add error handling for map initialization
const tryInitMap = (container: HTMLElement, options: L.MapOptions): L.Map | null => {
  try {
    // Apply Leaflet fixes before initializing
    fixLeafletMapErrors();
    
    // Create map with error handling
    return L.map(container, {
      ...options,
      // Set fadeAnimation to false to avoid _leaflet_pos errors
      fadeAnimation: false
    });
  } catch (error) {
    console.error('[MapView] Error initializing map:', error);
    return null;
  }
};

const MapView: React.FC<MapViewProps> = ({
  center = { lat: 19.076, lng: 72.8777 }, // Mumbai as default center
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  bottomSheetOpen = true,
  onBottomSheetOpenChange,
  bottomSheetContent,
  className = "",
  enableDragging = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [startDragY, setStartDragY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(
    bottomSheetOpen ? 300 : 80
  );

  // Get user's location when component mounts
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          // Update map center to user location if map exists
          if (mapRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], zoom);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Create map instance
      mapRef.current = tryInitMap(mapContainerRef.current, {
        center: [userLocation?.lat || center.lat, userLocation?.lng || center.lng],
        zoom,
        zoomControl: false,
        // @ts-ignore - 'tap' is valid in Leaflet but not in TypeScript definitions
        tap: true,
      });
      
      if (mapRef.current) {
        try {
          // Add tile layer - using OpenStreetMap
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(mapRef.current);
          
          // Add zoom control to top right
          L.control.zoom({ position: "topright" }).addTo(mapRef.current);

          // Add location control with error handling
          try {
            const locateControl = new (L.Control as any).Locate({
              position: 'topright',
              strings: {
                title: "Show my location"
              },
              flyTo: true,
              cacheLocation: false,
              showCompass: true,
              showPopup: false,
              locateOptions: {
                enableHighAccuracy: true
              }
            });
            
            // Add the control to the map
            locateControl.addTo(mapRef.current);
            
            // Handle location found event
            mapRef.current.on('locationfound', (e: L.LocationEvent) => {
              // Disable verbose logging in production
              if (process.env.NODE_ENV === 'development') {
                console.log('Location found:', e.latlng);
              }
              setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            });
            
            // Handle location error event
            mapRef.current.on('locationerror', (e: L.ErrorEvent) => {
              console.error('Location error:', e.message);
            });
          } catch (locateError) {
            console.error('[MapView] Error adding locate control:', locateError);
          }
          
          // Handle map click events if callback provided
          if (onMapClick) {
            mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
              const { lat, lng } = e.latlng;
              onMapClick({ lat, lng });
            });
          }
        } catch (err) {
          console.error('[MapView] Error initializing map components:', err);
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Function to force close the sheet
  const forceCloseSheet = () => {
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(false);
    }
    setBottomSheetHeight(80);
    setDragPosition(null);
    setStartDragY(null);
    setIsDragging(false);
  };
  
  // Update map center and zoom if props change
  useEffect(() => {
    if (mapRef.current) {
      // Limit console logging to prevent flooding
      // console.log("Updating map center:", center);
      mapRef.current.setView([center.lat, center.lng], zoom);
      
      // Add or update user location marker
      if (markersRef.current['userLocation']) {
        markersRef.current['userLocation'].setLatLng([center.lat, center.lng]);
      } else {
        // Create a custom icon for user location
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="user-location-dot"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Add user location marker
        markersRef.current['userLocation'] = L.marker([center.lat, center.lng], {
          icon: userIcon,
          zIndexOffset: 1000
        }).addTo(mapRef.current);
      }
    }
  }, [center, zoom]);

  // Add styles for user location marker
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .user-location-marker {
        background: none;
        border: none;
      }
      .user-location-dot {
        width: 20px;
        height: 20px;
        background-color: #4285F4;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px #4285F4;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper function to validate coordinates
  const isValidLatLng = (lat: number, lng: number): boolean => {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // Create custom marker icons for different marker types
  const getMarkerIcon = (markerType: MarkerType = 'attraction') => {
    let iconUrl = '';
    let iconSize: [number, number] = [25, 41];
    
    switch (markerType) {
      case 'attraction':
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
              break;
            case 'guide':
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
        break;
      case 'user':
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
              break;
      case 'poi':
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png';
              break;
            default:
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    }
    
    return L.icon({
      iconUrl,
      iconSize,
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41],
    });
  };

  // Update markers when props change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    // Add new markers
    markers.forEach((marker, index) => {
      const markerId = marker.id?.toString() || `marker-${index}`;
      const { position, title = "", popup = "", customIcon = false, markerType = 'attraction' } = marker;
      
      // Skip invalid coordinates to prevent errors
      if (!isValidLatLng(position.lat, position.lng)) {
        console.warn(`Invalid coordinates for marker ${markerId}: [${position.lat}, ${position.lng}]`);
        return;
      }

      const markerInstance = customIcon 
        ? L.marker([position.lat, position.lng], { icon: getMarkerIcon(markerType) })
        : L.marker([position.lat, position.lng]);

      if (popup) {
        markerInstance.bindPopup(popup);
      }

      // Add marker to map
      markerInstance.addTo(mapRef.current!);

      // Handle marker click event if callback provided
      if (onMarkerClick) {
        markerInstance.on("click", () => {
          onMarkerClick(marker);
        });
      }

      // Store marker reference
      markersRef.current[markerId] = markerInstance;
    });
  }, [markers, onMarkerClick]);

  // Handle bottom sheet open/close
  useEffect(() => {
    setBottomSheetHeight(bottomSheetOpen ? 300 : 80);
  }, [bottomSheetOpen]);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!enableDragging) return;
    
    // Only prevent default for mouse events to avoid breaking touch scrolling
    if (!("touches" in e)) {
      e.preventDefault();
    }
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartDragY(clientY);
    setIsDragging(true);
    
    // Add a class to the body to prevent scrolling
    document.body.classList.add('bottom-sheet-dragging');
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startDragY === null || !isDragging) return;
    
    // Only prevent default for mouse events to avoid breaking touch scrolling
    if (!("touches" in e)) {
      e.preventDefault();
    }
    
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = startDragY - clientY;
    
    // Calculate new position
    const newPosition = Math.max(
      80,
      Math.min(bottomSheetHeight + deltaY, 500)
    );
    
    setDragPosition(newPosition);
  };

  const handleDragEnd = () => {
    if (startDragY === null || !enableDragging) return;
    
    // Use dragPosition if available, otherwise fall back to the current bottomSheetHeight
    const threshold = 150;
    const currentPosition = dragPosition !== null ? dragPosition : bottomSheetHeight;
    const newOpen = currentPosition > threshold;
    
    if (onBottomSheetOpenChange) {
      onBottomSheetOpenChange(newOpen);
    }
    
    setBottomSheetHeight(newOpen ? 300 : 80);
    setDragPosition(null);
    setStartDragY(null);
    setIsDragging(false);
    
    // Remove the class from the body
    document.body.classList.remove('bottom-sheet-dragging');
  };

  // Properly handle global mouse move and mouse up for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const deltaY = startDragY! - e.clientY;
        const newPosition = Math.max(
          80,
          Math.min(bottomSheetHeight + deltaY, 500)
        );
        setDragPosition(newPosition);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches && e.touches.length > 0) {
        const deltaY = startDragY! - e.touches[0].clientY;
        const newPosition = Math.max(
          80,
          Math.min(bottomSheetHeight + deltaY, 500)
        );
        setDragPosition(newPosition);
      }
    };

    const handleGlobalEnd = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    // Add global event listeners
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, startDragY, bottomSheetHeight]);

  // Update height when bottomSheetOpen changes
  useEffect(() => {
    setBottomSheetHeight(bottomSheetOpen ? 300 : 80);
  }, [bottomSheetOpen]);
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full leaflet-container"></div>
      
      {/* Map center button */}
      <Button
        size="sm"
        variant="secondary"
        className="absolute right-4 bottom-4 z-[20] rounded-full shadow-md bg-white opacity-80 hover:opacity-100 h-10 w-10 p-0"
        onClick={() => {
          if (mapRef.current) {
            mapRef.current.setView([center.lat, center.lng], zoom);
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      </Button>
      
      {/* Fixed minimize button that's always visible when sheet is open */}
      {bottomSheetContent && bottomSheetOpen && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute left-4 bottom-4 z-[46] rounded-full shadow-md bg-white opacity-80 hover:opacity-100 h-10 w-10 p-0"
          onClick={() => forceCloseSheet()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </Button>
      )}
      
      {/* Use the shadcn/ui Sheet component for the bottom sheet */}
      {bottomSheetContent && (
        <Sheet open={bottomSheetOpen} onOpenChange={onBottomSheetOpenChange}>
          <SheetContent 
            side={null} 
            className="h-[60vh] px-0 rounded-t-xl overflow-hidden bottom-sheet"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-center py-2 border-b border-gray-100 bottom-sheet-drag relative z-[999]">
                <div 
                  className="w-16 h-2.5 bg-gray-400 rounded-full cursor-grab shadow-sm hover:bg-gray-500 transition-colors"
                  onMouseDown={enableDragging ? handleDragStart : undefined}
                  onTouchStart={enableDragging ? handleDragStart : undefined}
                  style={{ position: 'relative', top: 0, touchAction: 'none' }}
                ></div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {bottomSheetContent}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default MapView;