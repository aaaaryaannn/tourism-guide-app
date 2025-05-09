import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrainRoute } from '@/lib/mock-data';

interface TrainResultsProps {
  results: TrainRoute[];
  isLoading: boolean;
  onBookTrain: (train: TrainRoute, classType: 'sleeper' | 'ac3Tier' | 'ac2Tier') => void;
}

const TrainResults: React.FC<TrainResultsProps> = ({ results, isLoading, onBookTrain }) => {
  const [selectedClass, setSelectedClass] = useState<'sleeper' | 'ac3Tier' | 'ac2Tier'>('sleeper');

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
          <path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <rect width="20" height="8" x="2" y="11" rx="2" />
          <path d="M4 19h16" />
          <path d="M9 3v10" />
          <path d="M9 19v2" />
          <path d="M15 19v2" />
          <path d="M15 3v10" />
        </svg>
        <p className="text-gray-600 mb-1">No trains found for this route</p>
        <p className="text-gray-500 text-sm">Try changing your search criteria</p>
      </div>
    );
  }

  const formatDaysOfWeek = (days: string[]) => {
    if (days.length === 7) return "Daily";
    if (days.length >= 5) return days.join(", ");
    return days.join(", ");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-700 font-medium">{results.length} trains found</p>
        
        <Tabs value={selectedClass} onValueChange={(value) => setSelectedClass(value as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="sleeper" className="text-xs px-2 py-1">
              Sleeper
            </TabsTrigger>
            <TabsTrigger value="ac3Tier" className="text-xs px-2 py-1">
              AC 3 Tier
            </TabsTrigger>
            <TabsTrigger value="ac2Tier" className="text-xs px-2 py-1">
              AC 2 Tier
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {results.map((train) => (
        <Card key={train.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-medium text-lg">{train.trainName}</h3>
                  <div className="flex items-center text-gray-500 text-xs">
                    <span>Train #{train.trainNumber}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDaysOfWeek(train.daysOfOperation)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {train.availableSeats[selectedClass]} seats
                </Badge>
              </div>

              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{train.departureTime}</div>
                  <div className="text-xs text-gray-500">{train.from}</div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 px-4">
                  <div className="text-xs text-gray-500 mb-1">{train.duration}</div>
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
                      <rect width="8" height="6" x="8" y="6" rx="1" />
                      <path d="M19 8V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M6 10h12" />
                      <path d="M6 18h12" />
                      <path d="M5 14h14" />
                    </svg>
                    <div className="h-0.5 bg-gray-300 flex-1"></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold">{train.arrivalTime}</div>
                  <div className="text-xs text-gray-500">{train.to}</div>
                </div>
              </div>

              <div className="mt-4 border-t pt-3">
                <div className="flex justify-between items-center">
                  <div className="grid grid-cols-3 gap-4 text-sm flex-1">
                    <div>
                      <div className="font-medium">Sleeper</div>
                      <div className="text-gray-600">₹{train.price.sleeper}</div>
                      <div className="text-xs text-gray-500">{train.availableSeats.sleeper} available</div>
                    </div>
                    <div>
                      <div className="font-medium">AC 3 Tier</div>
                      <div className="text-gray-600">₹{train.price.ac3Tier}</div>
                      <div className="text-xs text-gray-500">{train.availableSeats.ac3Tier} available</div>
                    </div>
                    <div>
                      <div className="font-medium">AC 2 Tier</div>
                      <div className="text-gray-600">₹{train.price.ac2Tier}</div>
                      <div className="text-xs text-gray-500">{train.availableSeats.ac2Tier} available</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button 
                      className="bg-[#DC143C] hover:bg-[#B01030]"
                      onClick={() => onBookTrain(train, selectedClass)}
                    >
                      Book {selectedClass === 'sleeper' ? 'Sleeper' : 
                            selectedClass === 'ac3Tier' ? 'AC 3 Tier' : 
                            'AC 2 Tier'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrainResults; 