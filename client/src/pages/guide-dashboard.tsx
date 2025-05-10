import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import MapView from "@/components/map-view";
import GuideStats from "@/components/guide/guide-stats";
import RequestsPreview from "@/components/guide/requests-preview";
import UpcomingTours from "@/components/guide/upcoming-tours";
import { useAuth } from "@/lib/AuthContext";
import { ChatAssistant } from "@/components/chat-assistant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GuideBottomNavigation from "@/components/guide/bottom-navigation";
import { User } from "@/shared/schema";

interface Connection {
  id: number | string;
  fromUserId: string | number;
  toUserId: string | number;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  tripDetails?: string;
  budget?: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
}

interface Stats {
  pendingRequests: number;
  activeConnections: number;
  completedTours: number;
  rating: number;
  reviews: number;
}

// Define the place interface to fix TypeScript errors
interface Place {
  id: number | string;
  name: string;
  location: string;
  latitude: string;
  longitude: string;
  description?: string;
  category?: string;
}

// Create some mock places data for the map
const MOCK_PLACES: Place[] = [
  {
    id: "1",
    name: "Gateway of India",
    location: "Mumbai",
    latitude: "18.9220",
    longitude: "72.8347",
    description: "Iconic monument in Mumbai",
    category: "monument"
  },
  {
    id: "2",
    name: "Ajanta Caves",
    location: "Aurangabad",
    latitude: "20.5522",
    longitude: "75.7033",
    description: "Ancient Buddhist cave monuments",
    category: "heritage"
  },
  {
    id: "3",
    name: "Ellora Caves",
    location: "Aurangabad",
    latitude: "20.0258",
    longitude: "75.1780",
    description: "UNESCO World Heritage Site",
    category: "heritage"
  },
  {
    id: "4",
    name: "Shaniwar Wada",
    location: "Pune",
    latitude: "18.5195",
    longitude: "73.8553",
    description: "Historical fortification in Pune",
    category: "monument"
  }
];

const GuideDashboard: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);
  const { toast } = useToast();

  // Simplified authentication check
  useEffect(() => {
    console.log("Checking authentication for guide dashboard...");
    console.log("Auth loading:", authLoading);
    console.log("Current user:", user);
    console.log("Window auth object:", (window as any).auth);
    
    // Give a little time for auth to initialize
    setTimeout(() => {
      // First try to get user from context
      let currentUser = user;
      
      // If no user in context, check window.auth as fallback
      if (!currentUser && (window as any).auth?.user) {
        console.log("Using window.auth fallback:", (window as any).auth.user);
        currentUser = (window as any).auth.user;
      }
      
      if (!currentUser) {
        console.log("No user found, redirecting to login");
        toast({
          title: "Authentication required",
          description: "Please login to access guide dashboard",
          variant: "destructive",
        });
        setLocation('/login');
        return;
      }
      
      if (currentUser.userType !== 'guide') {
        console.log("User is not a guide, redirecting to dashboard");
        toast({
          title: "Access denied",
          description: "This page is only for guides",
          variant: "destructive",
        });
        setLocation('/dashboard');
        return;
      }
      
      console.log("Guide authenticated successfully:", currentUser);
    }, 200); // Short delay to ensure auth has time to initialize
  }, [user, authLoading, setLocation, toast]);

  // Use mock places data directly rather than querying
  const { data: places = MOCK_PLACES, isLoading: isLoadingPlaces } = useQuery<Place[]>({
    queryKey: ["/api/places"],
    // Return mock data directly 
    queryFn: () => Promise.resolve(MOCK_PLACES),
    // Only enable if user is authenticated as guide
    enabled: !!user && user.userType === 'guide',
  });

  // Stats query with mock data
  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ['/api/guide', user?.id, 'stats'],
    queryFn: async () => {
      return {
        pendingRequests: 3,
        activeConnections: 5,
        completedTours: 12,
        rating: 4.7,
        reviews: 28
      };
    },
    enabled: !!user?.id && user?.userType === 'guide',
  });

  // Query for recent connections with mock data
  const { data: recentConnections = [], isLoading: isLoadingConnections } = useQuery<Connection[]>({
    queryKey: ['/api/guide', user?.id, 'recent-connections'],
    queryFn: async (): Promise<Connection[]> => {
      // Mock data for testing
      const mockData: Connection[] = [
        {
          id: "1",
          fromUserId: "tourist1",
          toUserId: user?.id || "",
          status: "pending" as const,
          message: "I'm planning a trip to Mumbai next week. Would love your guidance!",
          tripDetails: "3-day trip to Mumbai, interested in historical sites",
          budget: "₹5000",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          fromUser: {
            id: "tourist1",
            username: "traveler123",
            fullName: "John Traveler",
            email: "john@example.com",
            userType: "tourist"
          }
        },
        {
          id: "2",
          fromUserId: "tourist2",
          toUserId: user?.id || "",
          status: "accepted" as const,
          message: "We're a family of 4 visiting Pune. Can you help us explore the city?",
          tripDetails: "5-day trip to Pune, family with children",
          budget: "₹10000",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          fromUser: {
            id: "tourist2",
            username: "explorer456",
            fullName: "Mary Explorer",
            email: "mary@example.com",
            userType: "tourist"
          }
        },
        {
          id: "3",
          fromUserId: "tourist3",
          toUserId: user?.id || "",
          status: "accepted" as const,
          message: "Looking for a guide in Aurangabad to visit Ajanta and Ellora caves.",
          tripDetails: "2-day trip to Aurangabad, focus on caves",
          budget: "₹7000",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          fromUser: {
            id: "tourist3",
            username: "hiker789",
            fullName: "Bob Hiker",
            email: "bob@example.com",
            userType: "tourist"
          }
        }
      ];
      return mockData;
    },
    enabled: !!user?.id && user?.userType === 'guide',
  });

  // Process connections
  const upcomingConnections = Array.isArray(recentConnections) 
    ? recentConnections
        .filter(conn => conn.status === 'accepted')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
    : [];

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Show loading state while authentication is in progress
  if (authLoading) {
    return <div className="h-full flex items-center justify-center">Loading authentication...</div>;
  }
  
  // Check both user context and window.auth
  const currentUser = user || (window as any).auth?.user;
  
  // If no user or not a guide, don't render anything (redirect will happen in useEffect)
  if (!currentUser) {
    return <div className="h-full flex items-center justify-center">Checking authentication...</div>;
  }
  
  if (currentUser.userType !== 'guide') {
    return null;
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header with Search Bar - Above map with high z-index */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-white/80 backdrop-blur-sm p-3 shadow-sm search-bar">
          <div className="relative">
            <Input
              placeholder="Search attractions, guides..."
              readOnly
              className="w-full pl-9 rounded-full"
              onClick={() => setLocation("/guide-search")}
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
          <div className="chat-assistant">
          <ChatAssistant />
          </div>
        </div>
      </div>

      {/* Map Wrapper - Take up the entire screen */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
      <MapView
          center={{ lat: 19.076, lng: 72.8777 }} // Mumbai center
          zoom={12}
          markers={places.filter(place => {
            // Validate coordinates before passing to MapView
            const lat = parseFloat(place.latitude);
            const lng = parseFloat(place.longitude);
            return !isNaN(lat) && !isNaN(lng) && 
                   lat >= -90 && lat <= 90 && 
                   lng >= -180 && lng <= 180;
          }).map((place) => ({
          position: {
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
          },
          title: place.name,
          popup: `<b>${place.name}</b><br>${place.location}`,
            customIcon: true,
            markerType: 'attraction'
        }))}
          bottomSheetOpen={bottomSheetOpen}
          onBottomSheetOpenChange={setBottomSheetOpen}
          enableDragging={true} // Make sure dragging is enabled
          className="h-full w-full"
        bottomSheetContent={
            <div className="bg-white h-full p-4 pb-16 space-y-4 overflow-y-auto">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#DC143C] rounded-full flex items-center justify-center text-white mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                    Welcome, {currentUser?.fullName.split(" ")[0]}
                </h2>
                <p className="text-sm text-gray-500">Guide Dashboard</p>
              </div>
            </div>

            <GuideStats />

            <RequestsPreview />

            <UpcomingTours />
          </div>
        }
      />
      </div>

      {/* Add some CSS to ensure the bottom sheet is over the map but doesn't affect it */}
      <style>{`
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
        
        /* Style the drag handle to make it more visible */
        .bottom-sheet-drag .w-16 {
          position: relative;
          z-index: 9999;
          pointer-events: auto !important;
        }
        
        /* Fix any map positioning issues */
        .leaflet-container {
          z-index: 1;
        }
        
        .leaflet-control-container {
          z-index: 10;
        }
      `}</style>

      {/* Bottom Navigation - Higher z-index */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <GuideBottomNavigation />
      </div>
    </div>
  );
};

export default GuideDashboard;
