import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout";
import { Loader2, MessageSquare } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
}

interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  toUser?: User;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
}

export default function ChatHub() {
  const { user, isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setError("Please log in to view your chats");
      setLoading(false);
      return;
    }

    const fetchConnections = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/connections`, {
          headers: {
            "Cache-Control": "no-cache"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch your chat connections");
        }

        const data = await response.json();
        
        // Filter for accepted connections only
        const acceptedConnections = data.filter(
          (conn: Connection) => conn.status === "accepted"
        );
        
        console.log("Accepted connections:", acceptedConnections);
        setConnections(acceptedConnections);
        
        // If there's only one connection, redirect directly to that chat
        if (acceptedConnections.length === 1) {
          const connectionId = acceptedConnections[0].id;
          const otherUser = getOtherUser(acceptedConnections[0]);
          
          // Store chat info for the individual chat page
          localStorage.setItem('currentChatInfo', JSON.stringify({
            connectionId,
            otherUserName: otherUser?.name || "User"
          }));
          
          setLocation(`/chat/${connectionId}`);
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setError("Failed to load your chat connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user, isLoggedIn, setLocation]);

  const getOtherUser = (connection: Connection): User | undefined => {
    if (!user) return undefined;
    
    if (user.role === "tourist") {
      return connection.toUser;
    } else {
      return connection.fromUser;
    }
  };

  const handleChatSelect = (connectionId: string, otherUser?: User) => {
    // Store chat info for the individual chat page
    localStorage.setItem('currentChatInfo', JSON.stringify({
      connectionId,
      otherUserName: otherUser?.name || "User"
    }));
    
    setLocation(`/chat/${connectionId}`);
  };

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Chats</h1>
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Please log in to view your chats
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Chats</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-lg text-gray-600 mb-4">
              You don't have any active chats yet
            </p>
            {user?.role === "tourist" ? (
              <Button onClick={() => setLocation("/search")}>
                Find a Guide
              </Button>
            ) : (
              <Button onClick={() => setLocation("/guide-connections")}>
                View Your Connections
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {connections.map((connection) => {
              const otherUser = getOtherUser(connection);
              return (
                <Card
                  key={connection.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleChatSelect(connection.id, otherUser)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={otherUser?.profilePicture} 
                        alt={otherUser?.name || "User"} 
                      />
                      <AvatarFallback>
                        {otherUser?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">
                          {otherUser?.name || "Unknown User"}
                        </h3>
                        {connection.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(connection.lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {connection.lastMessage?.text || "Start a conversation..."}
                      </p>
                    </div>
                    {otherUser?.role === "guide" && (
                      <Badge variant="outline" className="ml-2">Guide</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
} 