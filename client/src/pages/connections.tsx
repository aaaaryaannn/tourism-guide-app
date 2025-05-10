import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import GuideBottomNavigation from "@/components/guide/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import fixLeafletMapErrors from "@/lib/leaflet-fix";
import { Loader2, RefreshCcw } from "lucide-react";
import { User, GuideProfile } from "../shared/schema";

// Connection interface
interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromUser?: User;
  toUser?: User;
  guideProfile?: GuideProfile;
  message?: string;
  tripDetails?: string;
  budget?: string;
}

const Connections: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{sender: string, message: string, timestamp: Date}[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the current user from auth context
  const currentUser = (window as any).auth?.user;
  
  console.log("Rendering Connections component");
  console.log("Current user:", currentUser);
  
  // Check if user is loaded and redirect guides to guide connections page
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user found, waiting for auth");
      return; // Wait for auth to load
    }
    
    console.log("Current user loaded:", currentUser);
    console.log("User type:", currentUser.userType);
    
    // Redirect guides to the guide version of the page
    if (currentUser.userType === "guide") {
      console.log("User is a guide, redirecting to guide-connections");
      toast({
        title: "Redirecting to Guide Dashboard",
        description: "As a guide, you'll use the guide version of connections.",
      });
      
      setTimeout(() => {
        setLocation('/guide-connections');
      }, 1000);
      return;
    }
  }, [currentUser, setLocation, toast]);
  
  const fetchUserConnections = useCallback(async () => {
    if (!currentUser) {
      console.debug("[connections] No current user, skipping connections fetch");
      return;
    }

    setIsLoading(true);
    console.debug(`[connections] Fetching connections for user ${currentUser.id} (${currentUser.userType})`);

    try {
      const response = await fetch(`/api/users/${currentUser.id}/connections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[connections] Error response (${response.status}):`, errorText);
        const errorData = JSON.parse(errorText || "{}");
        throw new Error(errorData.message || `Failed to fetch connections. Status: ${response.status}`);
      }

      const data = await response.json();
      console.debug(`[connections] Fetched ${data.length} connections`);
      
      // Only log a sample connection in development
      if (process.env.NODE_ENV === 'development' && data.length > 0) {
        console.debug('[connections] Sample connection:', JSON.stringify(data[0], null, 2));
      }

      setConnections(data);
    } catch (error) {
      console.error('[connections] Error fetching connections:', error);
      toast({
        title: "Failed to fetch connections",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    console.log("Current connections data:", connections);
    console.log("Current user ID:", currentUser?.id);
  }, [currentUser?.id, connections]);

  // Create a debug function to log the current data
  const [directConnections, setDirectConnections] = useState<any[]>([]);
  const [useDirectConnections, setUseDirectConnections] = useState(false);
  
  const debugConnections = async () => {
    console.log("Current user:", currentUser);
    
    try {
      // Get connections directly from debug endpoint
      const response = await fetch(`/api/debug/connections`);
      const allConnections = await response.json();
      console.log("All connections from debug endpoint:", allConnections);

      // Find connections related to current user
      const myConnections = allConnections.connections.filter((conn: any) => 
        conn.fromUserId.toString() === currentUser?.id?.toString() || 
        conn.toUserId.toString() === currentUser?.id?.toString()
      );
      console.log("My connections:", myConnections);
      
      // Store direct connections
      setDirectConnections(myConnections);
      setUseDirectConnections(true);
      
      // Show success toast
      toast({
        title: "Found connections",
        description: `Found ${myConnections.length} connections for your account`,
      });
      
      // Fetch connections
      fetchUserConnections();
    } catch (error) {
      console.error("Error fetching debug connections:", error);
      toast({
        title: "Error fetching connections",
        description: "Please check the console for details",
        variant: "destructive",
      });
    }
  };

  // Simple role-based connection filtering - now memoized with useMemo
  const pendingConnections = useMemo(() => connections.filter(connection => {
    if (connection.status !== 'pending') return false;
    
    // For tourists: show outgoing pending requests they've sent to guides
    if (currentUser?.userType === 'tourist') {
      const isSentByMe = connection.fromUserId?.toString() === currentUser.id?.toString();
      return isSentByMe;
    } 
    // For guides: show incoming pending requests from tourists
    else if (currentUser?.userType === 'guide') {
      const isReceivedByMe = connection.toUserId?.toString() === currentUser.id?.toString();
      return isReceivedByMe;
    }
    
    return false;
  }), [connections, currentUser]);
  
  // Accepted connections for both roles - now memoized
  const acceptedConnections = useMemo(() => connections.filter(connection => 
    connection.status === 'accepted' && (
      connection.fromUserId?.toString() === currentUser?.id?.toString() || 
      connection.toUserId?.toString() === currentUser?.id?.toString()
    )
  ), [connections, currentUser]);
  
  // Rejected connections for both roles - now memoized
  const rejectedConnections = useMemo(() => connections.filter(connection =>
    connection.status === 'rejected' && (
      connection.fromUserId?.toString() === currentUser?.id?.toString() || 
      connection.toUserId?.toString() === currentUser?.id?.toString()
    )
  ), [connections, currentUser]);

  // Handle calling a guide
  const handleCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    } else {
      toast({
        title: "Contact information unavailable",
        description: "This guide has not provided a phone number",
        variant: "destructive",
      });
    }
  };
  
  // Handle messaging a guide
  const handleMessage = (connection: Connection) => {
    console.log("[CHAT] Opening WhatsApp chat for connection:", connection.id);
    
    // Get the guide's phone number
    const guide = getConnectionUser(connection);
    if (!guide?.phone) {
      toast({
        title: "No phone number",
        description: "This guide hasn't provided their phone number.",
        variant: "destructive",
      });
      return;
    }

    // Format phone number for WhatsApp URL
    // Remove any non-digit characters and ensure it starts with country code
    const formattedPhone = guide.phone.replace(/\D/g, '');
    
    // Create custom message
    const customMessage = `Hello I am ${currentUser?.fullName || 'a tourist'}, from Tour Guide App. Let's talk about the trip`;
    
    // URL encode the message to handle special characters
    const encodedMessage = encodeURIComponent(customMessage);
    
    // Create WhatsApp URL with pre-filled message
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    console.log("[CHAT] Opening WhatsApp URL:", whatsappUrl);
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  
  // Send a chat message
  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add message to the chat
    setChatMessages(prev => [
      ...prev, 
      {
        sender: "user",
        message: chatMessage,
        timestamp: new Date()
      }
    ]);
    
    // Clear the input
    setChatMessage("");
    
    // Simulate guide response (in a real app, this would be handled by a real-time system)
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        {
          sender: "guide",
          message: "Thank you for your message! I'll get back to you as soon as possible.",
          timestamp: new Date()
        }
      ]);
    }, 1500);
  };
  
  // Get user from connection based on current user type
  const getConnectionUser = (connection: Connection) => {
    if (!currentUser) return undefined;
    
    // Basic role-based display logic
    if (currentUser.userType === 'tourist') {
      // Tourists always want to see guide information
      return connection.toUser; // Guide is always the recipient (toUser)
    } 
    else if (currentUser.userType === 'guide') {
      // Guides always want to see tourist information
      return connection.fromUser; // Tourist is always the sender (fromUser)
    }
    
    // Fallback if user type is undefined
    if (connection.fromUserId === currentUser.id) {
      return connection.toUser;
    } else {
      return connection.fromUser;
    }
  };
  
  // Get appropriate role label based on user type
  const getUserRoleLabel = (user?: User) => {
    if (!user) return "Unknown";
    return user.userType === 'guide' ? 'Guide' : 'Tourist';
  };

  // Add useEffect to handle map errors
  useEffect(() => {
    // Apply Leaflet fixes only once when component mounts
    fixLeafletMapErrors();
    
    // Set up event listeners for tab changes
    const handleTabChange = () => {
      // Small delay to ensure DOM is updated
      setTimeout(fixLeafletMapErrors, 100);
    };
    
    // Listen to tab change events
    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', handleTabChange);
    });
    
    return () => {
      // Clean up listeners
      tabs.forEach(tab => {
        tab.removeEventListener('click', handleTabChange);
      });
    };
  }, []); // Empty dependency array to only run once on mount

  // Helper function to get guide profile from connection
  const getGuideProfile = (connection: Connection, otherUser?: User): GuideProfile | undefined => {
    // If we have a guide profile directly on the connection, use that
    if (connection.guideProfile) {
      return connection.guideProfile;
    }
    
    // If we have the other user and they have a guide profile, use that
    if (otherUser?.guideProfile) {
      return otherUser.guideProfile;
    }
    
    // Otherwise, try to find the guide profile from the connection users
    if (currentUser?.userType === 'tourist') {
      // For tourists, the guide profile should be on the toUser
      if (connection.toUser?.guideProfile) {
        return connection.toUser.guideProfile;
      }
    } else {
      // For guides, the guide profile should be on the fromUser
      if (connection.fromUser?.guideProfile) {
        return connection.fromUser.guideProfile;
      }
    }
    
    // If no guide profile found, return undefined
    return undefined;
  };

  // Add this useEffect for debug logging - but only in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Only log on initial load or when connections change
    console.debug('[connections] Processing connections data', {
      total: connections.length,
      pending: pendingConnections.length, 
      accepted: acceptedConnections.length,
      loggedInUser: currentUser?.id
    });
    
    // Avoid detailed logging of every connection to reduce flicker
  }, [connections.length, pendingConnections.length, acceptedConnections.length, 
      currentUser?.id]);

  // Add useEffect to call fetchUserConnections
  useEffect(() => {
    // Load connections only once on component mount
    fetchUserConnections();
    
    // No need for frequent polling - this was causing flickering
    // We now rely on manual refresh via the Refresh button
  }, [fetchUserConnections]);

  // Add detailed refresh connections function
  const refreshConnections = () => {
    console.debug('[connections] Manually refreshing connections');
    toast({
      title: "Refreshing connections",
      description: "Fetching your latest connection data...",
    });
    
    // Call fetchUserConnections (not treated as a promise)
    fetchUserConnections();
    
    // Add a timeout to check for the results after fetching
    setTimeout(() => {
      // Display counts after refresh
      const pendingCount = pendingConnections.length;
      const acceptedCount = acceptedConnections.length;
      
      console.debug('[connections] Refresh completed', { 
        pendingCount, 
        acceptedCount 
      });
      
      toast({
        title: "Connections refreshed",
        description: `Found ${pendingCount} pending and ${acceptedCount} accepted connections`,
      });
    }, 1000); // Wait a second for the state to update
  };

  // Update the accept and reject functions to use our direct fetch approach
  const handleAcceptRequest = async (connectionId: string) => {
    console.debug(`[connections] Guide accepting connection request: ${connectionId}`);
    
    toast({
      title: "Accepting request...",
      description: "Please wait while we process your acceptance.",
    });
    
    try {
      // Log exactly what we're sending
      console.debug(`[connections] PATCH request to /api/connections/${connectionId}`, {
        method: 'PATCH',
        body: { 
          status: 'accepted',
          userId: currentUser?.id 
        },
        userRole: currentUser?.userType
      });
      
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'accepted',
          userId: currentUser?.id 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[connections] Error response (${response.status}):`, errorText);
        const errorData = JSON.parse(errorText || "{}");
        throw new Error(errorData.message || `Failed to accept request. Status: ${response.status}`);
      }
      
      console.debug(`[connections] Successfully accepted connection ${connectionId}`);
      
      toast({
        title: "Request accepted",
        description: "You are now connected! The tourist will be notified.",
      });
      
      // Refetch connections after a short delay
      setTimeout(() => {
        fetchUserConnections();
      }, 500);
      
    } catch (error) {
      console.error('[connections] Error accepting request:', error);
      toast({
        title: "Failed to accept request",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectRequest = async (connectionId: string) => {
    console.debug(`[connections] Guide rejecting connection request: ${connectionId}`);
    
    toast({
      title: "Rejecting request...",
      description: "Please wait while we process your rejection.",
    });
    
    try {
      // Log exactly what we're sending
      console.debug(`[connections] PATCH request to /api/connections/${connectionId}`, {
        method: 'PATCH',
        body: { 
          status: 'rejected',
          userId: currentUser?.id 
        },
        userRole: currentUser?.userType
      });
      
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'rejected',
          userId: currentUser?.id 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[connections] Error response (${response.status}):`, errorText);
        const errorData = JSON.parse(errorText || "{}");
        throw new Error(errorData.message || `Failed to reject request. Status: ${response.status}`);
      }
      
      console.debug(`[connections] Successfully rejected connection ${connectionId}`);
      
      toast({
        title: "Request rejected",
        description: "The connection request has been rejected.",
      });
      
      // Refetch connections after a short delay
      setTimeout(() => {
        fetchUserConnections();
      }, 500);
      
    } catch (error) {
      console.error('[connections] Error rejecting request:', error);
      toast({
        title: "Failed to reject request",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Handle canceling a connection request (for tourists)
  const handleCancelRequest = async (connectionId: string) => {
    console.debug(`[connections] Canceling connection request: ${connectionId}`);
    
    toast({
      title: "Canceling request...",
      description: "Please wait while we process your cancellation.",
    });
    
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to cancel request. Status: ${response.status}`);
      }
      
      toast({
        title: "Request canceled",
        description: "Your connection request has been canceled.",
      });
      
      // Refetch connections after a short delay
      setTimeout(() => {
        fetchUserConnections();
      }, 500);
      
    } catch (error) {
      console.error('[connections] Error canceling request:', error);
      toast({
        title: "Failed to cancel request",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Connections</h1>
        <p>Please log in to view your connections.</p>
      </div>
    );
  }

  if (isLoading && connections.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Connections</h1>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading your connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Connections</h1>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Connections</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={refreshConnections} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-14">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold font-sans">Connections</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={debugConnections}
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
      
      {/* Debug message if using direct connections */}
      {useDirectConnections && (
        <div className="bg-green-50 border-b border-green-200 p-3">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-2 text-green-500"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Connections</h2>
          <Button variant="outline" size="sm" onClick={refreshConnections} className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="accepted" className="relative">
              Accepted
              {acceptedConnections.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#DC143C]">
                  {acceptedConnections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingConnections.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#DC143C]">
                  {pendingConnections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="relative">
              Rejected
              {rejectedConnections.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#DC143C]">
                  {rejectedConnections.length}
                </Badge>
              )}
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
                <TabsContent value="accepted" className="mt-0">
                  {acceptedConnections.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No accepted connections</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {currentUser.userType === "guide" 
                          ? "You haven't accepted any requests yet" 
                          : "No guides have accepted your requests yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {acceptedConnections.map((connection) => {
                        const otherParty = getConnectionUser(connection);
                        // Get guide profile using our helper function
                        const guideProfile = otherParty?.userType === 'guide' ? getGuideProfile(connection, otherParty) : undefined;
                        
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {otherParty?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                                <h3 className="font-semibold text-lg">{otherParty?.name}</h3>
                                <p className="text-gray-500 text-sm">
                                  {getUserRoleLabel(otherParty)}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-green-100 text-green-800 font-medium border-green-200">
                                    Connected
                                  </Badge>
                    </div>
                    </div>
                  </div>
                  
                            {/* Additional contact information now shown for accepted connections */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                              <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                              {otherParty?.phone ? (
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
                                  {otherParty.phone}
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
                                {otherParty?.email || 'No email provided'}
                              </p>
                            </div>
                            
                            {otherParty?.userType === 'guide' && guideProfile && (
                              <div className="grid grid-cols-2 gap-3 mb-3 text-sm bg-blue-50 p-3 rounded-md">
                                <div>
                                  <p className="text-gray-600">Location</p>
                                  <p className="font-medium">{guideProfile.location || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Experience</p>
                                  <p className="font-medium">{guideProfile.experience || 0} years</p>
                                </div>
                                
                                <div className="col-span-2">
                                  <p className="text-gray-600">Rating</p>
                                  <div className="flex items-center">
                                    {/* Star rating display */}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill={i < (guideProfile.rating || 0) ? "gold" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4 text-yellow-500"
                                      >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                                    ))}
                                    <span className="ml-1 font-medium">{guideProfile.rating || 'No rating'}</span>
                                  </div>
                                </div>
                                
                                <div className="col-span-2">
                                  <p className="text-gray-600">Specialties</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {guideProfile.specialties?.map((specialty, i) => (
                                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                        {specialty}
                                      </span>
                                    )) || 'None specified'}
                                  </div>
                                </div>
                                
                                <div className="col-span-2">
                                  <p className="text-gray-600">Languages</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {guideProfile.languages?.map((language, i) => (
                                      <span key={i} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                        {language}
                                      </span>
                                    )) || 'None specified'}
                  </div>
                </div>
                                
                                {guideProfile.bio && (
                                  <div className="col-span-2 mt-1">
                                    <p className="text-gray-600">Bio</p>
                                    <p className="text-sm mt-1">{guideProfile.bio}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {otherParty?.userType === "tourist" && connection.tripDetails && (
                              <div className="mb-3 text-sm">
                                <p className="text-gray-500">Trip Details</p>
                                <p className="font-medium">{connection.tripDetails}</p>
                                {connection.budget && (
                                  <div className="mt-2">
                                    <p className="text-gray-500">Budget</p>
                                    <p className="font-medium">{connection.budget}</p>
                                  </div>
                                )}
          </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                className="text-sm"
                                onClick={() => handleCall(otherParty?.phone)}
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
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
                                Call
            </Button>
          <Button 
                                className="text-sm bg-[#DC143C] hover:bg-[#B01030]"
                                onClick={() => handleMessage(connection)}
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
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Message
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="pending" className="mt-0">
                  {pendingConnections.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No pending connections</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {currentUser.userType === "guide" 
                          ? "You don't have any pending requests" 
                          : "You haven't sent any requests yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingConnections.map((connection) => {
                        const otherParty = getConnectionUser(connection);
                        // Get guide profile using our helper function
                        const guideProfile = otherParty?.userType === 'guide' ? getGuideProfile(connection, otherParty) : undefined;
                        const pending = connection.status === 'pending';
                        
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {otherParty?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{otherParty?.name}</h3>
                                <p className="text-gray-500 text-sm">
                                  {getUserRoleLabel(otherParty)}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-yellow-100 text-yellow-800 font-medium border-yellow-200">
                                    Pending
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {otherParty?.userType === 'guide' && guideProfile && (
                              <div className="grid grid-cols-2 gap-3 mb-3 text-sm bg-blue-50 p-3 rounded-md">
                                <div>
                                  <p className="text-gray-600">Location</p>
                                  <p className="font-medium">{guideProfile.location || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Experience</p>
                                  <p className="font-medium">{guideProfile.experience || 0} years</p>
                                </div>
                                
                                <div className="col-span-2">
                                  <p className="text-gray-600">Rating</p>
                                  <div className="flex items-center">
                                    {/* Star rating display */}
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill={i < (guideProfile.rating || 0) ? "gold" : "none"}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4 text-yellow-500"
                                      >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
                                    ))}
                                    <span className="ml-1 font-medium">{guideProfile.rating || 'No rating'}</span>
                                  </div>
                                </div>
                                
                                <div className="col-span-2">
                                  <p className="text-gray-600">Specialties</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {guideProfile.specialties?.map((specialty, i) => (
                                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                        {specialty}
                                      </span>
                                    )) || 'None specified'}
                                  </div>
                                </div>
                              </div>
                            )}
                            
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
                            
                            {currentUser.userType === "guide" && (
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 text-sm"
                                  onClick={() => handleRejectRequest(connection.id.toString())}
                                >
                                  Decline
                                </Button>
                                <Button
                                  className="text-sm bg-[#DC143C] hover:bg-[#B01030]"
                                  onClick={() => handleAcceptRequest(connection.id.toString())}
                                >
                                  Accept
                                </Button>
                              </div>
                            )}

                            {currentUser.userType === "tourist" && (
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 text-sm"
                                  onClick={() => handleCancelRequest(connection.id.toString())}
                                >
                                  Cancel Request
          </Button>
        </div>
                            )}
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
                        const otherParty = getConnectionUser(connection);
                        return (
                          <div key={connection.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold mr-3">
                                {otherParty?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{otherParty?.name}</h3>
                                <p className="text-gray-500 text-sm">
                                  {getUserRoleLabel(otherParty)}
                                </p>
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
      
      {/* Chat dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Chat with {selectedConnection?.fromUser?.name || selectedConnection?.toUser?.name}
            </DialogTitle>
            <DialogDescription>
              Send and receive messages directly
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 mb-4">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-[#DC143C] text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input 
              placeholder="Type a message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <Button 
              className="bg-[#DC143C] hover:bg-[#B01030]"
              onClick={sendMessage}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Navigation */}
      {currentUser.userType === "guide" ? (
        <GuideBottomNavigation />
      ) : (
      <BottomNavigation />
      )}
    </div>
  );
};

export default Connections;
