import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/bottom-navigation";
import MapView from "@/components/map-view";
import Categories from "@/components/home/categories";
import FeaturedPlaces from "@/components/home/featured-places";
import AvailableGuides from "@/components/home/available-guides";
import { ChatAssistant } from "@/components/chat-assistant";
import { useWikimedia } from "@/hooks/use-wikimedia";
import { Place } from "@shared/schema";

const Dashboard: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);
  
  // Fetch places from API
  const { data: rawPlaces = [], isLoading: isLoadingPlaces } = useQuery<Place[]>({
    queryKey: ['/api/places'],
    queryFn: async () => {
      const response = await fetch('/api/places');
      if (!response.ok) throw new Error('Failed to fetch places');
      return response.json();
    }
  });
  
  // Enhance places with Wikimedia images
  const { places, isLoading: isLoadingWikimedia } = useWikimedia(rawPlaces, {
    updateDatabase: true // Also update the backend data
  });

  // Boolean to check if any loading is in progress
  const isLoading = isLoadingPlaces || isLoadingWikimedia;

  // Use enhanced places data for rendering
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  
  // Update map markers when places change
  useEffect(() => {
    if (places && places.length > 0) {
      const markers = places
        .filter(place => 
          ['attraction', 'monument', 'heritage', 'landmark'].includes(place.category)
        )
        .map(place => ({
          position: {
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude)
          },
          title: place.name,
          popup: place.name,
          markerType: 'attraction'
        }));
      
      setMapMarkers(markers);
    }
  }, [places]);
  
  return (
    <div className="h-full flex flex-col pb-14">
      {/* Header */}
      <div className="relative z-10 bg-white shadow-md">
        <div className="flex items-center p-3 bg-white">
          <button className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gray-600"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <div className="flex-1 mx-2 relative">
            <Input 
              type="text" 
              placeholder="Search locations in Maharashtra" 
              className="w-full pl-9 rounded-full"
              onClick={() => setLocation('/search')}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 absolute left-3 top-3 text-gray-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <ChatAssistant />
        </div>
      </div>
      
      {/* Map View */}
      <div className="flex-1 relative">
        <MapView
          zoom={12}
          markers={mapMarkers}
          bottomSheetOpen={bottomSheetOpen}
          onBottomSheetOpenChange={setBottomSheetOpen}
          enableDragging={true}
          bottomSheetContent={
            <div className="p-4 pb-28 space-y-6">
              <Categories />
              <FeaturedPlaces places={places} isLoading={isLoading} />
              <AvailableGuides />
            </div>
          }
        />
      </div>
      
      <style jsx global>{`
        .bottom-sheet-dragging {
          overflow: hidden !important;
        }
        
        .bottom-sheet-drag {
          cursor: grab;
          touch-action: none !important;
        }
        
        .bottom-sheet-drag:active {
          cursor: grabbing;
        }
        
        .bottom-sheet-drag .w-16 {
          position: relative;
          z-index: 9999;
          pointer-events: auto !important;
        }
        
        .leaflet-container {
          z-index: 1;
        }
        
        .leaflet-control-container {
          z-index: 10;
        }
      `}</style>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default Dashboard;
