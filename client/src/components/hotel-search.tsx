import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Star, MapIcon, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Hotel type definition
interface Hotel {
  HotelId: string;
  HotelName: string;
  Category: string;
  Address: string;
  City: string;
  State: string;
  ZipCode: string;
  StarRating: number;
  Amenities: string[];
  PricePerNight: number;
  ImageUrl: string;
  Latitude?: number;
  Longitude?: number;
}

// Props for the component
interface HotelSearchProps {
  onSelectHotel: (hotel: Hotel) => void;
}

const HotelSearch: React.FC<HotelSearchProps> = ({ onSelectHotel }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [searchParams, setSearchParams] = useState({
    city: "",
    state: "",
    category: ""
  });
  
  // Available states and cities (will be populated from API)
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['1 Star', '2 Star', '3 Star', '4 Star', '5 Star']);
  
  // Transport modes
  const [transportMode, setTransportMode] = useState<'drive' | 'walk' | 'bicycle'>('drive');
  
  // Fetch hotels on component mount
  useEffect(() => {
    fetchAllHotels();
    getUserLocation();
  }, []);
  
  // Filter hotels when search params change
  useEffect(() => {
    filterHotels();
  }, [searchParams, hotels]);
  
  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus("success");
          
          // Sort hotels by proximity to user's location
          if (hotels.length > 0) {
            const sortedHotels = [...hotels].sort((a, b) => {
              if (!a.Latitude || !a.Longitude || !b.Latitude || !b.Longitude) return 0;
              
              const distanceA = calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                a.Latitude,
                a.Longitude
              );
              
              const distanceB = calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                b.Latitude,
                b.Longitude
              );
              
              return distanceA - distanceB;
            });
            
            setFilteredHotels(sortedHotels);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("error");
        }
      );
    } else {
      setLocationStatus("error");
    }
  };
  
  // Fetch all hotels
  const fetchAllHotels = async () => {
    setLoading(true);
    try {
      // First attempt with standard CORS mode
      let response;
      try {
        // NOTE: For a production solution, you should set up a proxy server.
        // Example using a backend proxy:
        // 1. Create a server endpoint in your backend like /api/hotels-proxy
        // 2. Have that endpoint make the request to the external API
        // 3. Then change this URL to your own backend endpoint like '/api/hotels-proxy'
        //
        // const response = await fetch('/api/hotels-proxy');
        
        response = await fetch('https://api.kosontechnology.com/india-hotel.php', {
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });
      } catch (fetchError) {
        console.log("First fetch attempt failed, trying with no-cors mode");
        // If first attempt fails, try with no-cors mode
        // Note: This will return an opaque response that can't be read,
        // but we'll try anyway and then fall back to sample data
        response = await fetch('https://api.kosontechnology.com/india-hotel.php', {
          mode: 'no-cors',
          headers: {
            'Accept': 'application/json'
          }
        });
      }
      
      // Check if the response was successful and we can read it
      // With no-cors, response.type will be 'opaque' and we can't read the data
      if (!response.ok || response.type === 'opaque') {
        throw new Error(`HTTP error or opaque response: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setHotels(data);
        setFilteredHotels(data);
        
        // Extract unique states and cities
        const stateSet = new Set<string>();
        const citySet = new Set<string>();
        
        data.forEach(hotel => {
          if (hotel.State) stateSet.add(hotel.State);
          if (hotel.City) citySet.add(hotel.City);
        });
        
        setStates(Array.from(stateSet));
        setCities(Array.from(citySet));
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      
      // Use fallback data for development - sample hotels from Maharashtra
      const fallbackHotels: Hotel[] = [
        {
          HotelId: "1",
          HotelName: "Taj Mahal Palace",
          Category: "5 Star",
          Address: "Apollo Bunder",
          City: "Mumbai",
          State: "Maharashtra",
          ZipCode: "400001",
          StarRating: 5.0,
          Amenities: ["Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Bar"],
          PricePerNight: 25000,
          ImageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
          Latitude: 18.9220,
          Longitude: 72.8347
        },
        {
          HotelId: "2",
          HotelName: "JW Marriott",
          Category: "5 Star",
          Address: "Juhu Tara Road",
          City: "Mumbai",
          State: "Maharashtra",
          ZipCode: "400049",
          StarRating: 4.8,
          Amenities: ["Free WiFi", "Swimming Pool", "Gym", "Restaurant", "Bar"],
          PricePerNight: 20000,
          ImageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          Latitude: 19.0962,
          Longitude: 72.8297
        },
        {
          HotelId: "3",
          HotelName: "Vivanta Pune",
          Category: "4 Star",
          Address: "Koregaon Park",
          City: "Pune",
          State: "Maharashtra",
          ZipCode: "411001",
          StarRating: 4.5,
          Amenities: ["Free WiFi", "Swimming Pool", "Restaurant", "Conference Room"],
          PricePerNight: 12000,
          ImageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          Latitude: 18.5362,
          Longitude: 73.8750
        },
        {
          HotelId: "4",
          HotelName: "Lemon Tree Premier",
          Category: "3 Star",
          Address: "Connaught Place",
          City: "Nagpur",
          State: "Maharashtra",
          ZipCode: "440010",
          StarRating: 3.8,
          Amenities: ["Free WiFi", "Restaurant", "Fitness Center"],
          PricePerNight: 8000,
          ImageUrl: "https://images.unsplash.com/photo-1587213811864-66b4c2c7b7ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
          Latitude: 21.1458,
          Longitude: 79.0882
        },
        {
          HotelId: "5",
          HotelName: "Hotel Sun N Sand",
          Category: "4 Star",
          Address: "Juhu Beach Road",
          City: "Mumbai",
          State: "Maharashtra",
          ZipCode: "400049",
          StarRating: 4.2,
          Amenities: ["Beach Access", "Swimming Pool", "Restaurant", "Bar"],
          PricePerNight: 15000,
          ImageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          Latitude: 19.0883,
          Longitude: 72.8260
        },
        {
          HotelId: "6",
          HotelName: "The Orchid Hotel",
          Category: "4 Star",
          Address: "Balewadi High Street",
          City: "Pune",
          State: "Maharashtra",
          ZipCode: "411045",
          StarRating: 4.3,
          Amenities: ["Free WiFi", "Restaurant", "Business Center", "Spa"],
          PricePerNight: 9500,
          ImageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          Latitude: 18.5765,
          Longitude: 73.7742
        }
      ];
      
      setHotels(fallbackHotels);
      setFilteredHotels(fallbackHotels);
      
      // Extract unique states and cities
      const stateSet = new Set<string>();
      const citySet = new Set<string>();
      
      fallbackHotels.forEach(hotel => {
        if (hotel.State) stateSet.add(hotel.State);
        if (hotel.City) citySet.add(hotel.City);
      });
      
      setStates(Array.from(stateSet));
      setCities(Array.from(citySet));
      
      console.log("Using fallback hotel data due to CORS or network error");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter hotels based on search params
  const filterHotels = () => {
    let filtered = [...hotels];
    
    if (searchParams.state) {
      filtered = filtered.filter(hotel => 
        hotel.State.toLowerCase() === searchParams.state.toLowerCase());
    }
    
    if (searchParams.city) {
      filtered = filtered.filter(hotel => 
        hotel.City.toLowerCase() === searchParams.city.toLowerCase());
    }
    
    if (searchParams.category && searchParams.category !== "all") {
      filtered = filtered.filter(hotel => 
        hotel.Category === searchParams.category);
    }
    
    setFilteredHotels(filtered);
  };
  
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  // Open directions dialog
  const handleShowDirections = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowDirections(true);
  };
  
  // Filter hotels based on search parameters
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    
    let filtered = [...hotels];
    
    if (searchParams.city) {
      filtered = filtered.filter(hotel => 
        hotel.City.toLowerCase().includes(searchParams.city.toLowerCase())
      );
    }
    
    if (searchParams.state) {
      filtered = filtered.filter(hotel => 
        hotel.State.toLowerCase().includes(searchParams.state.toLowerCase())
      );
    }
    
    if (searchParams.category) {
      filtered = filtered.filter(hotel => 
        hotel.Category === searchParams.category
      );
    }
    
    setFilteredHotels(filtered);
  };
  
  // Open hotel location in Google Maps
  const openInMaps = (hotel: Hotel) => {
    if (hotel.Latitude && hotel.Longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${hotel.Latitude},${hotel.Longitude}`;
      window.open(url, '_blank');
    } else {
      const query = encodeURIComponent(`${hotel.HotelName}, ${hotel.Address}, ${hotel.City}, ${hotel.State}, ${hotel.ZipCode}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <div>
      <Tabs defaultValue="search" className="mb-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Hotels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-4">
          <form onSubmit={applyFilters} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={searchParams.city}
                onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                placeholder="Enter city name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                value={searchParams.state}
                onChange={(e) => setSearchParams({...searchParams, state: e.target.value})}
                placeholder="Enter state name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={searchParams.category}
                onValueChange={(value) => setSearchParams({...searchParams, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Category</SelectItem>
                  <SelectItem value="1 Star">1 Star</SelectItem>
                  <SelectItem value="2 Star">2 Star</SelectItem>
                  <SelectItem value="3 Star">3 Star</SelectItem>
                  <SelectItem value="4 Star">4 Star</SelectItem>
                  <SelectItem value="5 Star">5 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 mr-2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search Hotels
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="nearby" className="mt-4">
          <div className="text-center mb-4">
            <p className="mb-3">Find hotels near your current location</p>
            <Button 
              onClick={getUserLocation}
              className="w-full"
              disabled={locationStatus === "loading"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 mr-2"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.4 11.5 7.6 11.7.3.2.8.2 1.1 0 .1-.1 7.6-6.3 7.6-11.7a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {locationStatus === "loading" ? "Detecting..." : "Detect My Location"}
            </Button>
            
            {locationStatus === "error" && (
              <p className="text-red-500 mt-2 text-sm">
                Unable to access your location. Please check your browser settings.
              </p>
            )}
            
            {locationStatus === "success" && (
              <p className="text-green-600 mt-2 text-sm">
                Location detected! Showing nearby hotels.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">
          {filteredHotels.length} {filteredHotels.length === 1 ? "Hotel" : "Hotels"} Found
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-[200px] w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
            <p className="text-gray-600">No hotels found matching your criteria.</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHotels.map((hotel) => (
              <Card key={hotel.HotelId} className="overflow-hidden">
                <div className="h-[200px] overflow-hidden">
                  <img 
                    src={hotel.ImageUrl} 
                    alt={hotel.HotelName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium">{hotel.HotelName}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                      {hotel.Category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {hotel.Address}, {hotel.City}, {hotel.State}
                  </p>
                  <div className="flex items-center mb-3">
                    <div className="flex mr-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={i < Math.floor(hotel.StarRating) ? "#FFD700" : "none"}
                          stroke="#FFD700"
                          className="w-4 h-4"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm">{hotel.StarRating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hotel.Amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {hotel.Amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        +{hotel.Amenities.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold">
                    ₹{hotel.PricePerNight.toLocaleString()}<span className="text-sm font-normal text-gray-600">/night</span>
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openInMaps(hotel)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-1"
                    >
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <polyline points="6 6 18 6 18 18" />
                    </svg>
                    Map
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#B01030]"
                    onClick={() => onSelectHotel(hotel)}
                  >
                    Select Hotel
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Directions Dialog */}
      <Dialog open={showDirections} onOpenChange={setShowDirections}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Directions to {selectedHotel?.HotelName}</DialogTitle>
            <DialogDescription>
              {selectedHotel?.Address}, {selectedHotel?.City}, {selectedHotel?.State}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button 
                variant={transportMode === 'drive' ? 'default' : 'outline'} 
                onClick={() => setTransportMode('drive')}
                className="flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                  <circle cx="6.5" cy="16.5" r="2.5" />
                  <circle cx="16.5" cy="16.5" r="2.5" />
                </svg>
                Drive
              </Button>
              <Button 
                variant={transportMode === 'walk' ? 'default' : 'outline'} 
                onClick={() => setTransportMode('walk')}
                className="flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 16L5 19M8 16l3 3M8 16l3.2-3.8a1 1 0 0 0 .8-1V5.5a1.5 1.5 0 0 1 3 0v4l2 .5" />
                  <path d="M12 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                </svg>
                Walk
              </Button>
              <Button 
                variant={transportMode === 'bicycle' ? 'default' : 'outline'} 
                onClick={() => setTransportMode('bicycle')}
                className="flex-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
                </svg>
                Bicycle
              </Button>
            </div>
            
            {userLocation && selectedHotel?.Latitude && selectedHotel?.Longitude && (
              <div className="aspect-[4/3] rounded-md overflow-hidden border">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBsY7TWdAUlcnJ_4UVJxpRDsfHLr6Jq8Sg
                    &origin=${userLocation.lat},${userLocation.lng}
                    &destination=${selectedHotel.Latitude},${selectedHotel.Longitude}
                    &mode=${transportMode}`}
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-lg">{selectedHotel?.HotelName}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedHotel?.Category}</p>
                <div className="mt-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{selectedHotel?.Address}, {selectedHotel?.City}, {selectedHotel?.State}</span>
                  </div>
                  {selectedHotel && selectedHotel.Amenities && selectedHotel.Amenities.length > 0 && (
                    <div className="flex items-center mt-1">
                      <span className="text-gray-500">Amenities: </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedHotel.Amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                        {selectedHotel.Amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            +{selectedHotel.Amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Distance</h3>
                <p className="text-sm mt-1">
                  {userLocation && selectedHotel?.Latitude && selectedHotel?.Longitude && (
                    <>
                      <span className="font-medium">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          selectedHotel.Latitude,
                          selectedHotel.Longitude
                        ).toFixed(1)} km
                      </span> from your location
                    </>
                  )}
                </p>
                <div className="mt-4">
                  <Button onClick={() => {
                    if (selectedHotel?.Latitude && selectedHotel?.Longitude) {
                      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${selectedHotel.Latitude},${selectedHotel.Longitude}&travelmode=${transportMode}`, '_blank');
                    }
                  }}>
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDirections(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowDirections(false);
              onSelectHotel(selectedHotel!);
            }}>
              Select Hotel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelSearch; 