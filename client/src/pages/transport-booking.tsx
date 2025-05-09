import { useState } from "react";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BusForm from "@/components/transport/bus-form";
import TrainForm from "@/components/transport/train-form";
import BusResults from "@/components/transport/bus-results";
import TrainResults from "@/components/transport/train-results";
import { generateMockBusRoutes, generateMockTrainRoutes, BusRoute, TrainRoute } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface SearchParams {
  from: string;
  to: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  busType?: string;
  trainClass?: 'sleeper' | 'ac3Tier' | 'ac2Tier';
}

const TransportBooking: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("buses");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [busResults, setBusResults] = useState<BusRoute[]>([]);
  const [trainResults, setTrainResults] = useState<TrainRoute[]>([]);
  
  // Handle search for buses
  const handleBusSearch = (params: any) => {
    setIsSearching(true);
    setShowResults(false);
    
    // Extract values from form
    const searchData: SearchParams = {
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      passengers: parseInt(params.passengers.split(' ')[0]),
      busType: params.busType
    };
    
    setSearchParams(searchData);
    
    // Simulate API call with delay
    setTimeout(() => {
      const results = generateMockBusRoutes(params.from, params.to);
      setBusResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 1500);
  };
  
  // Handle search for trains
  const handleTrainSearch = (params: any) => {
    setIsSearching(true);
    setShowResults(false);
    
    // Extract values from form
    const searchData: SearchParams = {
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      passengers: parseInt(params.passengers.split(' ')[0]),
      trainClass: params.class
    };
    
    setSearchParams(searchData);
    
    // Simulate API call with delay
    setTimeout(() => {
      const results = generateMockTrainRoutes(params.from, params.to);
      setTrainResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 1500);
  };
  
  // Handle booking a bus
  const handleBookBus = (bus: BusRoute) => {
    toast({
      title: "Booking Successful",
      description: `Your bus from ${bus.from} to ${bus.to} has been booked. Ticket: ${bus.id}`,
    });
    
    // Navigate back to dashboard
    setTimeout(() => {
      setLocation('/dashboard');
    }, 2000);
  };
  
  // Handle booking a train
  const handleBookTrain = (train: TrainRoute, classType: 'sleeper' | 'ac3Tier' | 'ac2Tier') => {
    toast({
      title: "Booking Successful",
      description: `Your train from ${train.from} to ${train.to} (${classType}) has been booked. Ticket: ${train.id}`,
    });
    
    // Navigate back to dashboard
    setTimeout(() => {
      setLocation('/dashboard');
    }, 2000);
  };
  
  return (
    <div className="h-full flex flex-col pb-14">
      {/* Header */}
      <div className="bg-[#DC143C] p-4 flex items-center text-white">
        <button 
          className="mr-2"
          onClick={() => setLocation('/dashboard')}
        >
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
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-medium">Transport Booking</h2>
      </div>
      
      <Tabs defaultValue="buses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b">
          <TabsTrigger value="trains" className="flex-1 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
              <rect width="20" height="8" x="2" y="11" rx="2" />
              <path d="M4 19h16" />
              <path d="M9 3v10" />
              <path d="M9 19v2" />
              <path d="M15 19v2" />
              <path d="M15 3v10" />
            </svg>
            Trains
          </TabsTrigger>
          <TabsTrigger value="buses" className="flex-1 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M8 6v6" />
              <path d="M15 6v6" />
              <path d="M2 12h19.6" />
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.2-.6-.8-1-1.4-1H5c-.6 0-1.2.4-1.4 1l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1 .8 2.8.8 2.8h3" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
            Buses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trains">
          {!showResults ? (
            <div className="p-4">
              <h3 className="text-lg font-medium mb-1">Search Trains</h3>
              <p className="text-gray-600 mb-4 text-sm">Find train routes across Maharashtra</p>
              
              <TrainForm onSearch={handleTrainSearch} isSearching={isSearching} />
            </div>
          ) : (
            <TrainResults 
              results={trainResults}
              isLoading={isSearching}
              onBookTrain={handleBookTrain}
            />
          )}
        </TabsContent>
        
        <TabsContent value="buses">
          {!showResults ? (
            <BusForm onSearch={handleBusSearch} isSearching={isSearching} />
          ) : (
            <BusResults 
              results={busResults}
              isLoading={isSearching}
              onBookBus={handleBookBus}
            />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Back to search button when showing results */}
      {showResults && (
        <div className="p-4 absolute bottom-16 w-full">
          <Button 
            onClick={() => setShowResults(false)}
            variant="outline"
            className="w-full"
          >
            Back to Search
          </Button>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default TransportBooking;
