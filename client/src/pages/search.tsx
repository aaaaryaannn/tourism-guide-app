import { Layout } from "../components/layout";
import MapView, { IMarker } from "../components/map-view";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Search, MapPin, Store, Coffee, Hotel, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { PlaceCategory, getPlacesNearby, geocodeAddress, GeoapifyPlace } from "../lib/geoapify";
import POICategories from "../components/search/poi-categories";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";

const topCategories = [
  { name: "Medical Stores", icon: Store, category: PlaceCategory.MEDICAL },
  { name: "Restaurants", icon: Coffee, category: PlaceCategory.RESTAURANT },
  { name: "Hotels", icon: Hotel, category: PlaceCategory.HOTEL },
  { name: "ATMs", icon: Store, category: PlaceCategory.ATM },
  { name: "Shopping", icon: Store, category: PlaceCategory.SHOPPING },
];

const gridCategories = [
  { name: "Attractions", icon: Landmark, category: PlaceCategory.ATTRACTION },
  { name: "Guides", icon: MapPin },
  { name: "Points of Interest", icon: MapPin },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 19.076,
    lng: 72.8777,
  });
  const [places, setPlaces] = useState<GeoapifyPlace[]>([]);
  const [mapMarkers, setMapMarkers] = useState<IMarker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Search for places when category changes
  useEffect(() => {
    if (selectedCategory) {
      searchPlaces(selectedCategory);
    }
  }, [selectedCategory, userLocation]);

  // Convert places to map markers
  useEffect(() => {
    const markers = places.map((place) => ({
      id: place.place_id,
      position: { lat: place.lat, lng: place.lon },
      title: place.name || "Unnamed place",
      popup: `<div>
        <h3 class="font-semibold">${place.name || "Unnamed place"}</h3>
        <p class="text-sm">${place.address_line1 || ""}</p>
        ${place.distance ? `<p class="text-xs mt-1">${(place.distance / 1000).toFixed(1)} km away</p>` : ""}
      </div>`,
      customIcon: true,
      markerType: getMarkerType(place.categories?.[0] || ""),
    }));

    setMapMarkers(markers);
  }, [places]);

  // Handle search
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const coords = await geocodeAddress(searchQuery);
      if (coords) {
        setUserLocation(coords);
        if (selectedCategory) {
          searchPlaces(selectedCategory);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Search for places
  const searchPlaces = async (categoryName: string) => {
    setIsSearching(true);
    try {
      const category = topCategories.find((c) => c.name === categoryName)?.category || 
                       gridCategories.find((c) => c.name === categoryName)?.category;
      
      if (category) {
        const results = await getPlacesNearby(userLocation, category, 5000);
        setPlaces(results);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: PlaceCategory) => {
    setShowCategorySheet(false);
    const categoryInfo = [
      ...topCategories,
      ...gridCategories.filter(c => c.category)
    ].find((c) => c.category === category);
    
    if (categoryInfo) {
      setSelectedCategory(categoryInfo.name);
    }
  };

  // Get marker type based on place category
  const getMarkerType = (category: string): "attraction" | "guide" | "user" | "poi" => {
    if (category.includes("tourism") || category.includes("attraction")) {
      return "attraction";
    } else if (category.includes("accommodation") || category.includes("hotel")) {
      return "guide";
    } else {
      return "poi";
    }
  };

  // Handle marker click
  const handleMarkerClick = (marker: IMarker) => {
    console.log("Marker clicked:", marker);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <div className="p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search places, guides, or attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Button type="submit" className="sr-only">Search</Button>
          </form>

          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex space-x-2">
              {topCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1">
          <MapView
            center={userLocation}
            markers={mapMarkers}
            onMarkerClick={handleMarkerClick}
            className="w-full h-full"
          />
        </div>

        <Sheet open={showCategorySheet} onOpenChange={setShowCategorySheet}>
          <SheetTrigger asChild>
            <Button variant="outline" className="mx-4 my-2">Show All Categories</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-4/5">
            <POICategories onCategorySelect={handleCategorySelect} />
          </SheetContent>
        </Sheet>

        <Card className="mx-4 mb-4 p-4">
          <div className="grid grid-cols-3 gap-4">
            {gridCategories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => category.category ? setSelectedCategory(category.name) : setShowCategorySheet(true)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <category.icon className="h-6 w-6 mb-2" />
                <span className="text-sm text-center">{category.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        {places.length > 0 && (
          <Card className="mx-4 mb-4 p-4 max-h-64 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Search Results</h3>
            <div className="space-y-2">
              {places.map((place) => (
                <div key={place.place_id} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{place.name || "Unnamed place"}</p>
                    <p className="text-sm text-gray-500">{place.address_line1 || ""}</p>
                  </div>
                  {place.distance && (
                    <span className="ml-auto text-xs text-gray-500">{(place.distance / 1000).toFixed(1)} km</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
