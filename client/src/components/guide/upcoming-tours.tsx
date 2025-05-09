import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/AuthContext";

const UpcomingTours: React.FC = () => {
  const [_, setLocation] = useLocation();

  const { user } = useAuth();
  const { data: upcomingTours, isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "itineraries"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/itineraries`);
      if (!response.ok) throw new Error("Failed to fetch trips");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Only show up to 2 tours in the preview
  const displayTours = upcomingTours?.slice(0, 2) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">My Trips</h3>
        <Button
          variant="ghost"
          className="text-xs h-8 text-[#DC143C]"
          onClick={() => setLocation("/guide-itineraries")}
        >
          See All
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading tours...</div>
      ) : displayTours.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-300 mx-auto mb-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <p className="text-gray-500">No upcoming tours</p>
            <p className="text-xs text-gray-400 mt-1 mb-2">
              Create your first itinerary
            </p>
            <Button
              className="text-xs h-8 bg-[#DC143C] hover:bg-[#B01030]"
              onClick={() => setLocation("/guide-itineraries")}
            >
              Create Itinerary
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {displayTours.map((tour) => (
            <Card
              key={tour.id}
              className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-base">{tour.title}</h3>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Upcoming
                  </Badge>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-500">
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
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  <span>
                    {tour.startDate
                      ? new Date(tour.startDate).toLocaleDateString()
                      : "No start date"}
                    {tour.endDate
                      ? ` - ${new Date(tour.endDate).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>

                <div className="mt-1 flex items-center text-sm text-gray-500">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{tour.touristCount || 0} Tourists</span>
                </div>

                <div className="mt-1 flex items-center text-sm text-gray-500">
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{tour.places?.length || 0} Places</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default UpcomingTours;
