import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AvailableGuides() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tripDetails, setTripDetails] = useState("");
  const [budget, setBudget] = useState("");
  const [tripCity, setTripCity] = useState("");

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const response = await fetch('/api/guides');
      if (!response.ok) {
        throw new Error('Failed to fetch guides');
      }
      return response.json();
    }
  });

  const sendRequest = useMutation({
    mutationFn: async (guideId: string) => {
      console.log("Sending request to guide:", guideId);
      console.log("Current user:", user);
      console.log("Current user ID:", user?.id);
      console.log("Guide ID:", guideId);

      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      // Ensure both IDs are strings
      const fromUserId = user.id.toString();
      const toUserId = guideId.toString();

      console.log("Actual IDs being sent:", { fromUserId, toUserId });

      const payload = {
        fromUserId,
        toUserId,
        status: 'pending',
        message: message || 'Hello! I would like to connect with you.',
        tripDetails: `City: ${tripCity}\n${tripDetails || 'No additional details provided'}`,
        budget: budget || 'Not specified'
      };

      console.log("Request payload:", payload);

      try {
        // Log the full request details
        console.log("Making request to:", '/api/connections');
        console.log("Request headers:", {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        });

        const response = await fetch('/api/connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        // First try to get the response as text
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        // Try to parse as JSON if possible
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("Response is not valid JSON:", responseText);
          throw new Error(`Server returned invalid JSON response. Status: ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        console.log("Connection created:", data);
        return data;
      } catch (error) {
        console.error("Error in request:", error);
        // Add request URL to error message for debugging
        throw new Error(`Failed to send request to /api/connections: ${error.message}`);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Request sent!",
        description: "Your request has been sent to the guide.",
      });
      setIsDialogOpen(false);
      setMessage("");
      setTripCity("");
      setTripDetails("");
      setBudget("");
      
      // Invalidate and refetch all relevant queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/users', user.id, 'connections'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
        
        // Force an immediate refetch
        queryClient.refetchQueries({ 
          queryKey: ['/api/users', user.id, 'connections'],
          exact: true 
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error sending request:", error);
      toast({
        title: "Failed to send request",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  const handleRequestGuide = (guide: any) => {
    // Prevent users from requesting themselves as a guide
    if (guide.id?.toString() === user?.id?.toString()) {
      toast({
        title: "Cannot connect with yourself",
        description: "You cannot request yourself as a guide.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedGuide(guide);
    setIsDialogOpen(true);
  };

  const handleSendRequest = () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message for the guide",
        variant: "destructive",
      });
      return;
    }
    if (selectedGuide?.id) {
      sendRequest.mutate(selectedGuide.id.toString());
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading guides...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-4">Available Guides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {guides.map((guide: any) => (
          <Card key={guide.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={guide.imageUrl} />
                  <AvatarFallback>{guide.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{guide.fullName}</h3>
                  <p className="text-sm text-gray-500">{guide.guideProfile?.location || 'Maharashtra'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-yellow-500">★</span>
                    <span className="text-sm">{guide.guideProfile?.rating || 'New'}</span>
                  </div>
                </div>
                {guide.id?.toString() !== user?.id?.toString() ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRequestGuide(guide)}
                  >
                    Request Guide
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="opacity-50"
                  >
                    Your Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Request Guide</DialogTitle>
          <DialogDescription>
            Send a request to {selectedGuide?.fullName}. Once they accept, you'll be able to communicate directly.
          </DialogDescription>
          
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="tripCity" className="block text-sm font-medium mb-1">
                City to Visit
              </label>
              <input
                id="tripCity"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter the city you want to visit..."
                value={tripCity}
                onChange={(e) => setTripCity(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium mb-1">
                Budget Range
              </label>
              <input
                id="budget"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter your budget range (e.g. ₹5000-₹7000)..."
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="tripDetails" className="block text-sm font-medium mb-1">
                Additional Details
              </label>
              <Textarea
                id="tripDetails"
                placeholder="Any specific requirements or preferences..."
                value={tripDetails}
                onChange={(e) => setTripDetails(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message to Guide
              </label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain what you're looking for..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSendRequest} 
              disabled={sendRequest.isPending || !tripCity.trim()}
            >
              {sendRequest.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
