import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GuideBottomNavigation from "@/components/guide/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define user interface
interface User {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: string;
}

// Define connection interface
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
}

const GuideRequests: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  // Get user from window.auth (set in App.tsx)
  const auth = (window as any).auth;
  let user = auth?.user;
  
  // Redirect if not authenticated or restore from localStorage
  useEffect(() => {
    if (!user) {
      console.log("No user found in guide-requests, checking localStorage");
      
      // Check if we have a user in localStorage first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          // Parse the stored user
          const parsedUser = JSON.parse(storedUser);
          console.log("Found stored user:", parsedUser);
          
          // Update the global auth object
          if (auth) {
            auth.user = parsedUser;
            user = parsedUser; // Update local reference
            console.log("Updated auth with stored user");
          } else {
            // If auth object doesn't exist, create it
            (window as any).auth = { 
              user: parsedUser,
              isAuthenticated: true
            };
            user = parsedUser;
            console.log("Created new auth object with stored user");
          }
          return; // Don't redirect if we found a stored user
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
      
      toast({
        title: "Authentication required",
        description: "Please login to access guide requests",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, setLocation, toast]);
  
  // Log the user ID for debugging
  useEffect(() => {
    if (user) {
      console.log("Current guide ID:", user.id);
      console.log("Guide ID type:", typeof user.id);
    }
  }, [user]);
  
  // Query for connection requests
  const { data: connections = [], isLoading } = useQuery<Connection[]>({
    queryKey: ['/api/users', user?.id, 'connections'],
    queryFn: async () => {
      const currentUser = user || (window as any).auth?.user;
      if (!currentUser?.id) {
        return [];
      }
      try {
        const response = await fetch(`/api/users/${currentUser.id}/connections`);
        if (!response.ok) throw new Error('Failed to fetch connections');
        const data = await response.json();
        
        // Log the connections for debugging
        console.log("All connections:", data);
        return data;
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    },
    enabled: !!(user?.id || (window as any).auth?.user?.id),
  });
  
  // Filter connections based on active tab and only get connections where this guide is the recipient
  const filteredConnections = connections
    .filter(connection => {
      // Get current user reference
      const currentUser = user || (window as any).auth?.user;
      
      // Log each connection's to/from IDs for debugging
      console.log(`Connection ${connection.id}:`, {
        fromUserId: connection.fromUserId,
        fromUserIdType: typeof connection.fromUserId,
        toUserId: connection.toUserId,
        toUserIdType: typeof connection.toUserId,
        userIdMatch: connection.toUserId == currentUser?.id,
        status: connection.status,
        statusMatch: connection.status === activeTab
      });
      
      return connection.status === activeTab && 
             connection.toUserId.toString() === currentUser?.id?.toString();
    }) || [];
  
  // Log filtered connections for debugging
  useEffect(() => {
    console.log("Filtered connections for tab", activeTab, ":", filteredConnections);
  }, [filteredConnections, activeTab]);
  
  // Handle accepting a connection request
  const updateConnectionStatus = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: number | string; status: string }) => {
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
      const currentUser = user || (window as any).auth?.user;
      queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'connections'] });
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
    try {
      await updateConnectionStatus.mutateAsync({ 
        connectionId, 
        status: 'rejected' 
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  
  // Component for empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-12 h-12 text-gray-300 mb-4"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
      <p className="text-gray-500 text-center">
        {activeTab === 'pending' 
          ? "No pending requests yet" 
          : activeTab === 'accepted' 
            ? "No accepted requests yet" 
            : "No rejected requests yet"}
      </p>
      <p className="text-gray-400 text-sm text-center mt-1">
        {activeTab === 'pending' 
          ? "New requests will appear here" 
          : activeTab === 'accepted' 
            ? "Accepted requests will appear here" 
            : "Rejected requests will appear here"}
      </p>
    </div>
  );
  
  // Get tourist from connection
  const getTouristFromConnection = (connection: Connection): User | undefined => {
    const currentUser = user || (window as any).auth?.user;
    if (!connection.fromUser || !connection.toUser) return undefined;
    
    // If the current user is the 'to' user, then the tourist is the 'from' user
    if (connection.toUserId.toString() === currentUser?.id?.toString()) {
      return connection.fromUser;
    }
    
    // Otherwise, the tourist is the 'to' user
    return connection.toUser;
  };
  
  return (
    <div className="flex flex-col h-full pb-16">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Guide Requests</h1>
        <p className="text-gray-500 text-sm">Manage tourist requests for your guidance</p>
      </div>
      
      <Tabs defaultValue="pending" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
            <TabsTrigger value="accepted" className="flex-1">Accepted</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="pending" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="p-4 text-center">Loading requests...</div>
            ) : filteredConnections.length === 0 ? (
              <EmptyState />
            ) : (
              filteredConnections.map((connection) => {
                const tourist = getTouristFromConnection(connection);
                return (
                  <Card key={connection.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src="" alt={tourist?.fullName} />
                            <AvatarFallback>
                              {tourist?.fullName?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{tourist?.fullName}</span>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              Requested on {new Date(connection.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-600">
                          <p><span className="font-medium">Message:</span> {connection.message}</p>
                          {connection.tripDetails && (
                            <p className="mt-1"><span className="font-medium">Trip Details:</span> {connection.tripDetails}</p>
                          )}
                          {connection.budget && (
                            <p className="mt-1"><span className="font-medium">Budget:</span> {connection.budget}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex border-t">
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-none py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(connection.id)}
                        >
                          Reject
                        </Button>
                        <div className="w-px bg-gray-200"></div>
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-none py-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAccept(connection.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="accepted" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="p-4 text-center">Loading requests...</div>
            ) : filteredConnections.length === 0 ? (
              <EmptyState />
            ) : (
              filteredConnections.map((connection) => {
                const tourist = getTouristFromConnection(connection);
                return (
                  <Card key={connection.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="" alt={tourist?.fullName} />
                          <AvatarFallback>
                            {tourist?.fullName?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{tourist?.fullName}</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Accepted
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Accepted on {new Date(connection.updatedAt || connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          className="text-sm h-9"
                          onClick={() => setLocation(`/chat/${connection.id}`)}
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
                            <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                            <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                          </svg>
                          Message
                        </Button>
                        <Button className="text-sm h-9 bg-[#DC143C] hover:bg-[#B01030]">
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
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M8 12h8" />
                            <path d="M12 8v8" />
                          </svg>
                          Create Tour
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="p-4 text-center">Loading requests...</div>
            ) : filteredConnections.length === 0 ? (
              <EmptyState />
            ) : (
              filteredConnections.map((connection) => {
                const tourist = getTouristFromConnection(connection);
                return (
                  <Card key={connection.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="" alt={tourist?.fullName} />
                          <AvatarFallback>
                            {tourist?.fullName?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{tourist?.fullName}</span>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Rejected
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Rejected on {new Date(connection.updatedAt || connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </div>
      </Tabs>
      
      <GuideBottomNavigation />
    </div>
  );
};

export default GuideRequests;