import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GuideBottomNavigation from "@/components/guide/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, MessageSquare } from "lucide-react";

// Guide profile interface
interface GuideProfile {
  id: number | string;
  userId: number | string;
  location: string;
  specialties: string[];
  languages: string[];
  experience: number;
  rating: number;
  bio: string;
}

// User interface
interface User {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: string;
}

// Connection interface
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
  toUser?: User;
  guideProfile?: GuideProfile;
}

const GuideConnections: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{sender: string, message: string, timestamp: Date}[]>([]);
  
  console.log("Rendering Guide Connections component");
  
  // Get user from window.auth (set in App.tsx)
  const auth = (window as any).auth;
  let currentUser = auth?.user;
  console.log("User in guide connections page:", currentUser);
  
  // Check for stored user before rendering
  useEffect(() => {
    // If no user in window.auth, check localStorage
    if (!currentUser) {
      console.log("No user in window.auth, checking localStorage");
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          // Parse the stored user
          const parsedUser = JSON.parse(storedUser);
          console.log("Found stored user:", parsedUser);
          
          // Update the global auth object
          if (auth) {
            auth.user = parsedUser;
            currentUser = parsedUser; // Update local reference
            console.log("Updated auth with stored user");
          } else {
            // If auth object doesn't exist, create it
            (window as any).auth = { 
              user: parsedUser,
              isAuthenticated: true
            };
            currentUser = parsedUser;
            console.log("Created new auth object with stored user");
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
  }, []);
  
  // Fetch guide's connections with improved error handling and debugging
  const { data: connections = [], isLoading, refetch: refetchConnections } = useQuery<Connection[]>({
    queryKey: ['/api/users', currentUser?.id, 'connections'],
    queryFn: async () => {
      const currentUser = (window as any).auth?.user;
      if (!currentUser?.id) return [];
      
      console.log("[DEBUG] Fetching connections for guide:", currentUser.id);
      try {
        console.log(`[DEBUG] Making request to: /api/users/${currentUser.id}/connections`);
        const response = await fetch(`/api/users/${currentUser.id}/connections`);
        
        if (!response.ok) {
          console.error(`[DEBUG] Error response from connections API: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch connections: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("[DEBUG] Fetched connections:", data);
        
        // Log specific guide-related connections
        const guideConnections = data.filter((c: Connection) => 
          c.toUserId?.toString() === currentUser?.id?.toString()
        );
        console.log("[DEBUG] Guide's incoming connections:", guideConnections);
        
        return data;
      } catch (error) {
        console.error("[DEBUG] Error fetching guide connections:", error);
        toast({
          title: "Error fetching connections",
          description: "Could not load your connections. Please try again later.",
          variant: "destructive",
        });
        return []; // Return empty array on error
      }
    },
    enabled: !!(currentUser?.id && currentUser?.userType === 'guide'),
    refetchInterval: 5000, // Refetch every 5 seconds to check for status changes
    staleTime: 0, // Consider data always stale to force refetch
  });
  
  // Enhanced user check
  useEffect(() => {
    if (!isLoading && !currentUser) {
      console.log("[Auth] No user found, redirecting to login");
      window.location.href = '/login';
      return;
    }
    
    if (!isLoading && currentUser && currentUser.userType !== 'guide') {
      console.log("[Auth] User is not a guide, redirecting to connections page");
      toast({
        title: "Access denied",
        description: "This page is only for guides. Redirecting to the tourist connections page.",
        variant: "destructive"
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/connections';
      }, 2000);
      return;
    }
    
    if (!isLoading && currentUser && currentUser.userType === 'guide') {
      console.log("[Auth] Guide authenticated successfully");
      toast({
        title: "Guide Dashboard",
        description: "Welcome to your guide connections dashboard. Here you can manage tourist requests.",
      });
    }
  }, [currentUser, isLoading]);
  
  // Update connection status mutation with improved handling
  const updateConnectionStatus = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: number | string; status: string }) => {
      console.log("[DEBUG] Updating connection status:", { connectionId, status });
      try {
        const response = await apiRequest("PATCH", `/api/connections/${connectionId}`, { 
          status,
          userId: currentUser?.id // Add the current user's ID to the request
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[DEBUG] Error updating connection: ${errorText}`);
          throw new Error(`Failed to update connection: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("[DEBUG] Connection updated successfully:", data);
        return data;
      } catch (error) {
        console.error("[DEBUG] Error updating connection:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Connection updated",
        description: "The connection status has been updated",
      });
      
      // Invalidate and refetch connections to ensure the UI is updated
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'connections'] });
      
      // Force an immediate refetch after a short delay to ensure the update is reflected
      setTimeout(() => {
        refetchConnections();
      }, 500);
      
      console.log("[DEBUG] Connection status updated in the database:", data);
    },
    onError: (error) => {
      console.error("[DEBUG] Error in mutation:", error);
      toast({
        title: "Error",
        description: "Failed to update connection status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle accepting a connection request (for guides)
  const handleAcceptRequest = async (connectionId: number | string) => {
    try {
      console.log("[DEBUG] Accepting connection request:", connectionId);
      toast({
        title: "Processing...",
        description: "Accepting the connection request",
      });
      
      // Call the mutation to update the status in the database
      await updateConnectionStatus.mutateAsync({ 
        connectionId, 
        status: 'accepted' 
      });
      
      toast({
        title: "Request accepted",
        description: "You've accepted the connection request. The tourist will be notified.",
      });
      
      // Force a new data fetch after the update
      setTimeout(() => {
        refetchConnections();
      }, 1000);
      
    } catch (error) {
      console.error("[DEBUG] Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle rejecting a connection request (for guides)
  const handleRejectRequest = async (connectionId: number | string) => {
    try {
      console.log("[DEBUG] Rejecting connection request:", connectionId);
      toast({
        title: "Processing...",
        description: "Rejecting the connection request",
      });
      
      // Call the mutation to update the status in the database
      await updateConnectionStatus.mutateAsync({ 
        connectionId, 
        status: 'rejected' 
      });
      
      toast({
        title: "Request rejected",
        description: "You've rejected the connection request",
      });
      
      // Force a new data fetch after the update
      setTimeout(() => {
        refetchConnections();
      }, 1000);
      
    } catch (error) {
      console.error("[DEBUG] Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Force refresh connections data with improved feedback
  const refreshConnections = async () => {
    console.log("[DEBUG] Manually refreshing connections data");
    toast({
      title: "Refreshing connections",
      description: "Fetching the latest data from the server...",
    });
    
    try {
      // First invalidate the query to clear cached data
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'connections'] });
      
      // Then force a refetch to get fresh data
      const result = await refetchConnections();
      
      // Log the result for debugging
      console.log("[DEBUG] Refresh result:", {
        success: result.isSuccess,
        data: result.data,
        error: result.error,
        dataLength: result.data?.length || 0
      });
      
      if (result.isSuccess) {
        // Update the counts for better feedback
        const pendingCount = result.data?.filter(c => 
          c.status === 'pending' && c.toUserId?.toString() === currentUser?.id?.toString()
        ).length || 0;
        
        const acceptedCount = result.data?.filter(c => 
          c.status === 'accepted' && (
            c.toUserId?.toString() === currentUser?.id?.toString() || 
            c.fromUserId?.toString() === currentUser?.id?.toString()
          )
        ).length || 0;
        
        toast({
          title: "Data refreshed",
          description: `Found ${pendingCount} pending and ${acceptedCount} accepted connections`,
        });
      } else {
        console.error("[DEBUG] Refresh failed:", result.error);
        toast({
          title: "Refresh failed",
          description: "Could not fetch the latest connections. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[DEBUG] Error during manual refresh:", error);
      toast({
        title: "Refresh error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter connections by status with string safety
  const pendingConnections = connections.filter(c => {
    // Only show pending connections where the current guide is the receiver (toUserId)
    const isPending = c.status === 'pending';
    const isForGuide = c.toUserId?.toString() === currentUser?.id?.toString();
    
    if (isPending && isForGuide) {
      console.log("[DEBUG] Found pending connection for guide:", c.id);
    }
    
    return isPending && isForGuide;
  });
  
  // Only show accepted connections where the current guide is involved
  const acceptedConnections = connections.filter(c => {
    const isAccepted = c.status === 'accepted';
    const isGuideInvolved = (
      c.toUserId?.toString() === currentUser?.id?.toString() || 
      c.fromUserId?.toString() === currentUser?.id?.toString()
    );
    
    return isAccepted && isGuideInvolved;
  });
  
  // Only show rejected connections where the current guide rejected them
  const rejectedConnections = connections.filter(c => {
    const isRejected = c.status === 'rejected';
    const wasForGuide = c.toUserId?.toString() === currentUser?.id?.toString();
    
    return isRejected && wasForGuide;
  });

  // Log connections data for debugging purposes
  useEffect(() => {
    if (connections && connections.length > 0) {
      // Log all connection IDs for debugging
      console.log("[DEBUG] All connections:", connections.map(c => ({
        id: c.id,
        fromUserId: c.fromUserId,
        toUserId: c.toUserId,
        status: c.status
      })));
      
      // Log guides connections
      console.log("[DEBUG] Connection counts:", {
        total: connections.length,
        forGuide: connections.filter(c => c.toUserId?.toString() === currentUser?.id?.toString()).length,
        pending: pendingConnections.length,
        accepted: acceptedConnections.length,
        rejected: rejectedConnections.length
      });
    } else {
      console.log("[DEBUG] No connections found in the data");
    }
  }, [connections, pendingConnections, acceptedConnections, rejectedConnections, currentUser?.id]);
  
  // Get user from connection based on whether they're the tourist or guide
  const getConnectionUser = (connection: Connection): User | undefined => {
    if (currentUser?.userType === 'guide') {
      // If current user is guide, show the tourist (fromUser)
      return connection.fromUser;
    } else {
      // If current user is tourist, show the guide (toUser)
      return connection.toUser;
    }
  };
  
  // Get appropriate role label
  const getUserRoleLabel = (user?: User) => {
    if (!user) return "Unknown";
    return user.userType === 'guide' ? 'Guide' : 'Tourist';
  };

  // Update the useEffect hook for connections to increase refresh rate
  useEffect(() => {
    // Initial fetch and periodic refresh to keep UI in sync with database
    const intervalId = setInterval(() => {
      if (currentUser?.id) {
        console.log("[SYNC] Performing periodic connections refresh");
        refetchConnections();
      }
    }, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(intervalId);
  }, [currentUser?.id, refetchConnections]);

  // Enhance the checkDebugConnections function to better handle data comparison
  const checkDebugConnections = async () => {
    console.log("[DEBUG] Checking guide connections directly from debug endpoint");
    
    try {
      // Use fetch with a timeout to prevent hanging if the server is unresponsive
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`/api/debug/connections`, {
        signal: controller.signal,
        // Add cache busting query parameter to prevent caching
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("[DEBUG] Error fetching debug connections:", response.status, response.statusText);
        toast({
          title: "Debug check failed",
          description: `Server returned error: ${response.status} ${response.statusText}`,
          variant: "destructive"
        });
        return;
      }
      
      const data = await response.json();
      
      // Deep check for connections that should be visible to this guide
      if (data.connections && data.connections.length > 0) {
        // Force UIDs to be strings for consistent comparison
        const stringifyId = (id: string | number | undefined): string => id?.toString() || '';
        const currentUserIdStr = stringifyId(currentUser?.id);
        
        const relevantDbConnections = data.connections.filter((conn: any) => 
          // Pending: where guide is recipient
          (conn.status === 'pending' && stringifyId(conn.toUserId) === currentUserIdStr) ||
          // Accepted: where guide is involved (recipient or sender)
          (conn.status === 'accepted' && 
            (stringifyId(conn.toUserId) === currentUserIdStr || 
             stringifyId(conn.fromUserId) === currentUserIdStr)) ||
          // Rejected: where guide is recipient 
          (conn.status === 'rejected' && stringifyId(conn.toUserId) === currentUserIdStr)
        );
        
        const uiConnectionIds = new Set(connections.map(c => stringifyId(c.id)));
        const dbConnectionIds = new Set(relevantDbConnections.map((c: any) => stringifyId(c._id || c.id)));
        
        // Check for missing connections in UI
        const missingInUI = relevantDbConnections.filter(
          (c: any) => !uiConnectionIds.has(stringifyId(c._id || c.id))
        );
        
        // Check for connections in UI that aren't in DB (shouldn't happen normally)
        const missingInDB = connections.filter(
          (c: Connection) => !dbConnectionIds.has(stringifyId(c.id))
        );
        
        if (missingInUI.length > 0 || missingInDB.length > 0) {
          console.log("[DEBUG] Connection mismatch detected:", {
            missingInUI: missingInUI.length,
            missingInDB: missingInDB.length
          });
          
          toast({
            title: "Synchronizing data",
            description: "Updating connection data from the database...",
          });
          
          // Force a full refetch with no caching
          await queryClient.invalidateQueries({ 
            queryKey: ['/api/users', currentUser?.id, 'connections'],
            refetchType: 'all'
          });
        }
      }
    } catch (error) {
      console.error("[DEBUG] Error in debug check:", error);
      toast({
        title: "Debug check error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Call the debug check once when the component mounts
  useEffect(() => {
    if (currentUser?.id) {
      checkDebugConnections();
    }
  }, [currentUser?.id]);

  // Function to open chat with a tourist
  const openChat = (connection: Connection) => {
    console.log("[CHAT] Opening WhatsApp chat for connection:", connection.id);
    
    // Get the tourist's phone number
    const tourist = getConnectionUser(connection);
    if (!tourist?.phone) {
      toast({
        title: "No phone number",
        description: "This tourist hasn't provided their phone number.",
        variant: "destructive",
      });
      return;
    }

    // Format phone number for WhatsApp URL
    // Remove any non-digit characters and ensure it starts with country code
    const formattedPhone = tourist.phone.replace(/\D/g, '');
    
    // Create custom message
    const customMessage = `Hello I am ${currentUser?.fullName || 'your guide'}, from Tour Guide App. Let's talk about the trip`;
    
    // URL encode the message to handle special characters
    const encodedMessage = encodeURIComponent(customMessage);
    
    // Create WhatsApp URL with pre-filled message
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log("[CHAT] Opening WhatsApp URL:", whatsappUrl);
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  // When refreshing connections, force a refresh of the data
  const refreshConnectionsWithDebug = async () => {
    console.log("[REFRESH] Forcing refresh of connections with debug");
    toast({
      title: "Refreshing connections",
      description: "Checking for new and updated connections...",
    });
    
    try {
      // First check debug endpoint
      await checkDebugConnections();
      
      // Then force refresh the connections
      const result = await refetchConnections();
      
      // Log the results
      if (result.error) {
        console.error("[REFRESH] Error refreshing connections:", result.error);
        toast({
          title: "Error refreshing",
          description: "Could not refresh connections. Try again later.",
          variant: "destructive"
        });
      } else {
        console.log("[REFRESH] Connections refreshed successfully");
        
        // Show success message with counts
        const pendingCount = pendingConnections.length;
        const acceptedCount = acceptedConnections.length;
        toast({
          title: "Connections refreshed",
          description: `Found ${result.data?.length || 0} connections (${pendingCount} pending, ${acceptedCount} accepted)`,
        });
      }
    } catch (error) {
      console.error("[REFRESH] Error in refresh process:", error);
      toast({
        title: "Refresh failed",
        description: "An unexpected error occurred while refreshing connections.",
        variant: "destructive"
      });
    }
  };

  // Enhanced debugging for connections
  const logConnectionsStatus = (connections: Connection[]) => {
    console.log("[DEBUG CONNECTIONS] Full connections data:", connections);
    
    // Check for empty or invalid connections array
    if (!connections || connections.length === 0) {
      console.log("[DEBUG CONNECTIONS] No connections found in data");
      return;
    }
    
    // Count by status
    const pending = connections.filter(c => c.status === 'pending').length;
    const accepted = connections.filter(c => c.status === 'accepted').length;
    const rejected = connections.filter(c => c.status === 'rejected').length;
    
    console.log(`[DEBUG CONNECTIONS] Total: ${connections.length}, Pending: ${pending}, Accepted: ${accepted}, Rejected: ${rejected}`);
    
    // Log each connection with essential info
    connections.forEach((c: Connection, i: number) => {
      console.log(`[DEBUG CONNECTIONS] Connection ${i+1}:`, {
        id: c.id,
        fromUser: c.fromUser?.fullName,
        toUser: c.toUser?.fullName,
        fromUserId: c.fromUserId,
        toUserId: c.toUserId,
        status: c.status,
        message: c.message?.substring(0, 20) + (c.message?.length > 20 ? '...' : ''),
        createdAt: c.createdAt
      });
    });
  };

  useEffect(() => {
    // Call the debug function when connections data changes
    logConnectionsStatus(connections);
  }, [connections]);

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full">Redirecting to login...</div>;
  }

  return (
    <div className="h-full flex flex-col pb-14">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold font-sans">Guide Connections</h2>
                      <Button 
                        variant="outline" 
          size="sm"
          onClick={refreshConnectionsWithDebug}
          className="text-xs"
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
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path>
            <path d="M21 16a9 9 0 0 1-9 9"></path>
                        </svg>
          Reload
                      </Button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4 h-12 bg-gray-100">
            <TabsTrigger 
              value="pending" 
              className="relative data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              onClick={() => setActiveTab('pending')}
            >
              <span className="flex items-center">
                Pending
                {pendingConnections.length > 0 && (
                  <Badge className="ml-1.5 bg-yellow-500">{pendingConnections.length}</Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="accepted" 
              className="relative data-[state=active]:bg-green-50 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600"
              onClick={() => setActiveTab('accepted')}
            >
              <span className="flex items-center">
                Accepted
                {acceptedConnections.length > 0 && (
                  <Badge className="ml-1.5 bg-green-500">{acceptedConnections.length}</Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              className="relative data-[state=active]:bg-red-50 data-[state=active]:text-red-800 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600"
              onClick={() => setActiveTab('rejected')}
            >
              <span className="flex items-center">
                Rejected
                {rejectedConnections.length > 0 && (
                  <Badge className="ml-1.5 bg-red-500">{rejectedConnections.length}</Badge>
                )}
              </span>
            </TabsTrigger>
          </TabsList>
        
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center mb-3">
                      <Skeleton className="w-16 h-16 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j}>
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
        </div>
                </div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="pending" className="mt-0">
                  {pendingConnections.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No pending requests</p>
                      <p className="text-gray-400 text-sm mt-1">You don't have any pending connection requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingConnections.map((connection) => {
                        const tourist = getConnectionUser(connection);
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {tourist?.fullName?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{tourist?.fullName || 'Tourist'}</h3>
                                <p className="text-gray-500 text-sm">{getUserRoleLabel(tourist)}</p>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-yellow-100 text-yellow-800 font-medium border-yellow-200">
                                    Pending
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-gray-600 text-sm">{connection.message}</p>
                              
                              {connection.tripDetails && (
                                <div className="mt-2 text-sm">
                                  <p className="text-gray-500">Trip Details</p>
                                  <p className="font-medium">{connection.tripDetails}</p>
                                </div>
                              )}
                              
                              {connection.budget && (
                                <div className="mt-2 text-sm">
                                  <p className="text-gray-500">Budget</p>
                                  <p className="font-medium">{connection.budget}</p>
                                </div>
                              )}
              </div>
              
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 text-sm"
                                onClick={() => handleRejectRequest(connection.id)}
                              >
                                Decline
                              </Button>
                              <Button
                                className="text-sm bg-[#DC143C] hover:bg-[#B01030]"
                                onClick={() => handleAcceptRequest(connection.id)}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                </div>
                  )}
                </TabsContent>
                
                <TabsContent value="accepted" className="mt-4 focus:outline-none">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-4">
                          <div className="flex items-center mb-3">
                            <Skeleton className="w-16 h-16 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-5 w-32 mb-1" />
                              <Skeleton className="h-3 w-24 mb-1" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {[1, 2, 3, 4].map((j) => (
                              <div key={j}>
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : acceptedConnections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-3 bg-blue-100 p-3 rounded-full">
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold">No accepted connections yet</h3>
                      <p className="text-gray-500 mt-1 max-w-sm">
                        When you accept guide requests, they will appear here.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={refreshConnectionsWithDebug}
                      >
                        Refresh Connections
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {acceptedConnections.map((connection) => {
                        const tourist = getConnectionUser(connection);
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {tourist?.fullName?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{tourist?.fullName || 'Tourist'}</h3>
                                <p className="text-gray-500 text-sm">{getUserRoleLabel(tourist)}</p>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-green-100 text-green-800 font-medium border-green-200">
                                    Connected
                                  </Badge>
                                </div>
                              </div>
                </div>
                
                            {/* Tourist contact information */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                              <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                              {tourist?.phone ? (
                                <p className="flex items-center text-gray-700 mb-1">
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
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                                  {tourist.phone}
                                </p>
                              ) : (
                                <p className="text-gray-500 italic mb-1">No phone number provided</p>
                              )}
                              
                              <p className="flex items-center text-gray-700">
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
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
              </svg>
                                {tourist?.email || 'No email provided'}
                              </p>
                            </div>
                            
                            {/* Trip details in a nice formatted box */}
                            {connection.tripDetails && (
                              <div className="mb-3 text-sm bg-blue-50 p-3 rounded-md">
                                <h4 className="font-semibold text-gray-700 mb-1">Trip Details</h4>
                                <p className="font-medium text-gray-700">{connection.tripDetails}</p>
                                
                                {connection.budget && (
                                  <div className="mt-3">
                                    <h4 className="font-semibold text-gray-700 mb-1">Budget</h4>
                                    <p className="font-medium text-gray-700">{connection.budget}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex justify-between space-x-3 mt-3">
                              <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => openChat(connection)}
                              >
                                <span className="flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-2" />
              Message Tourist
                                </span>
            </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="rejected" className="mt-0">
                  {rejectedConnections.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No rejected connections</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rejectedConnections.map((connection) => {
                        const tourist = getConnectionUser(connection);
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {tourist?.fullName?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{tourist?.fullName || 'Tourist'}</h3>
                                <p className="text-gray-500 text-sm">{getUserRoleLabel(tourist)}</p>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-red-100 text-red-800 font-medium border-red-200">
                                    Rejected
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-gray-600 text-sm">{connection.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <GuideBottomNavigation />
    </div>
  );
};

export default GuideConnections;