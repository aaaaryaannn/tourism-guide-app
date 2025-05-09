import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define the connection interface
interface Connection {
  id: string | number;
  fromUserId: string | number;
  toUserId: string | number;
  status: string;
  message: string;
  createdAt: string;
  tourist?: {
    fullName?: string;
  };
}

const RequestsPreview: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user from window.auth (set in App.tsx)
  const auth = (window as any).auth;
  const user = auth?.user;
  
  // Query for pending connection requests
  const { data: pendingRequests = [], isLoading } = useQuery<Connection[]>({
    queryKey: ['/api/guide/connections', { status: 'pending' }],
  });
  
  // Only show up to 2 requests in the preview
  const displayRequests = pendingRequests.slice(0, 2);
  const totalRequests = pendingRequests.length;
  
  // Handle updating connection status (accept/decline)
  const updateConnectionStatus = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: number | string; status: string }) => {
      // Include user ID in the request body
      const response = await apiRequest("PATCH", `/api/connections/${connectionId}`, { 
        status,
        userId: user?.id // Pass current user ID with the request
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection updated",
        description: "The connection status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guide/connections'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update connection status",
        variant: "destructive",
      });
    },
  });
  
  // Handle accepting a connection request
  const handleAccept = async (connectionId: number | string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to accept requests",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateConnectionStatus.mutateAsync({ 
        connectionId, 
        status: 'accepted' 
      });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  
  // Handle rejecting a connection request
  const handleReject = async (connectionId: number | string) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to reject requests",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateConnectionStatus.mutateAsync({ 
        connectionId, 
        status: 'rejected' 
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Pending Requests</h3>
        <Button 
          variant="ghost" 
          className="text-xs h-8 text-[#DC143C]"
          onClick={() => setLocation('/guide-requests')}
        >
          See All
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading requests...</div>
      ) : displayRequests.length === 0 ? (
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
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <p className="text-gray-500">No pending requests</p>
            <p className="text-xs text-gray-400 mt-1">New requests will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {displayRequests.map((request: Connection) => (
            <Card key={request.id} className="mb-3 overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src="" alt={request.tourist?.fullName} />
                    <AvatarFallback>
                      {request.tourist?.fullName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{request.tourist?.fullName}</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0 border-t">
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleReject(request.id)}
                >
                  Decline
                </Button>
                <div className="w-px bg-gray-200 h-10"></div>
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-none text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleAccept(request.id)}
                >
                  Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {totalRequests > 2 && (
            <div className="text-center mt-2">
              <Button
                variant="link"
                className="text-sm text-[#DC143C]"
                onClick={() => setLocation('/guide-requests')}
              >
                View {totalRequests - 2} more requests
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequestsPreview;