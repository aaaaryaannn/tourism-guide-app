import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusRoute } from '@/lib/mock-data';

interface BusResultsProps {
  results: BusRoute[];
  isLoading: boolean;
  onBookBus: (bus: BusRoute) => void;
}

const BusResults: React.FC<BusResultsProps> = ({ results, isLoading, onBookBus }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex justify-between mb-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-10">
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
          <path d="M8 6v6" />
          <path d="M15 6v6" />
          <path d="M2 12h19.6" />
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.2-.6-.8-1-1.4-1H5c-.6 0-1.2.4-1.4 1l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1 .8 2.8.8 2.8h3" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
        <p className="text-gray-600 mb-1">No buses found for this route</p>
        <p className="text-gray-500 text-sm">Try changing your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-700 font-medium">{results.length} buses found</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 mr-1"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M11 18h4" />
            </svg>
            Filter
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 mr-1"
            >
              <path d="M11 5H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18 2h-4a2 2 0 0 0-2 2v4" />
              <path d="M15 5 8 12" />
            </svg>
            Sort
          </Button>
        </div>
      </div>

      {results.map((bus) => (
        <Card key={bus.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{bus.busOperator}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {bus.busType}
                  </Badge>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(bus.rating) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-3 h-3 ${i < Math.floor(bus.rating) ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span className="text-xs ml-1 text-gray-600">{bus.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{bus.departureTime}</div>
                  <div className="text-xs text-gray-500">{bus.from}</div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 px-4">
                  <div className="text-xs text-gray-500 mb-1">{bus.duration}</div>
                  <div className="w-full flex items-center">
                    <div className="h-0.5 bg-gray-300 flex-1"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mx-1 text-gray-400"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    <div className="h-0.5 bg-gray-300 flex-1"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{bus.distance}</div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">{bus.arrivalTime}</div>
                  <div className="text-xs text-gray-500">{bus.to}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {bus.amenities.map((amenity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center mt-3">
                <div>
                  <span className="text-lg font-bold">₹{bus.price}</span>
                  <span className="text-xs text-gray-500 ml-1">per seat</span>
                  <div className="text-xs text-gray-500">
                    {bus.availableSeats} seats available
                  </div>
                </div>
                <Button 
                  className="bg-[#DC143C] hover:bg-[#B01030]"
                  onClick={() => onBookBus(bus)}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusResults; 