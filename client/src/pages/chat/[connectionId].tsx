import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import Layout from "@/components/layout";

// Define message interface
interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'tourist' | 'guide';
  profilePicture?: string;
}

// Define props interface for ChatPage
interface ChatPageProps {
  connectionId?: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ connectionId: propConnectionId }) => {
  const [_, params] = useRoute<{ connectionId: string }>("/chat/:connectionId");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: currentUser, isLoggedIn } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [otherUserName, setOtherUserName] = useState<string>("User");
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Use the prop connectionId if provided, otherwise fall back to route param
  const connectionId = propConnectionId || params?.connectionId;
  
  // Load any chat info stored when navigating from connections
  useEffect(() => {
    try {
      const chatInfoStr = localStorage.getItem('currentChatInfo');
      if (chatInfoStr) {
        const chatInfo = JSON.parse(chatInfoStr);
        if (chatInfo.connectionId === connectionId) {
          setOtherUserName(chatInfo.otherUserName);
        }
      }
    } catch (error) {
      console.error("[chat] Error loading chat info from localStorage:", error);
    }
  }, [connectionId]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to access chat",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }
    
    if (!connectionId) {
      toast({
        title: "Invalid chat",
        description: "No connection specified",
        variant: "destructive",
      });
      setLocation('/chat');
      return;
    }
    
    // Fetch messages initially
    fetchMessages();
    
    // Set up polling for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    setRefreshInterval(interval);
    
    // Clean up on component unmount
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [currentUser, connectionId, isLoggedIn]);
  
  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Fetch messages for this connection
  const fetchMessages = async () => {
    if (!connectionId || !currentUser) return;
    
    try {
      setIsLoading(true);
      
      // Fetch connection details first to get the other user ID
      let recipientId = "recipient";
      try {
        const connResponse = await fetch(`/api/connections/${connectionId}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (connResponse.ok) {
          const connData = await connResponse.json();
          
          // Set the other user name
          const isFromUser = connData.fromUserId === currentUser.id;
          const otherUser = isFromUser ? connData.toUser : connData.fromUser;
          
          if (otherUser) {
            setOtherUserName(otherUser.name || "User");
            recipientId = otherUser.id;
          }
        }
      } catch (error) {
        console.error("[chat] Error fetching connection details:", error);
      }
      
      // Try to fetch messages from the server
      const response = await fetch(`/api/connections/${connectionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache'
        }
      }).catch(error => {
        console.error("[chat] Network error fetching messages:", error);
        return null;
      });
      
      // If server fetch fails, try localStorage as fallback
      if (!response || !response.ok) {
        console.debug("[chat] Server fetch failed, using localStorage");
        const storedMessages = localStorage.getItem(`chat_messages_${connectionId}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        } else if (messages.length === 0) {
          // If no stored messages and we haven't initialized yet, create a welcome message
          const initialMessages: Message[] = [{
            id: "welcome",
            connectionId: connectionId,
            senderId: "system",
            recipientId: currentUser.id,
            content: "Start chatting with your connection! Messages are locally stored for now.",
            timestamp: new Date().toISOString(),
            read: true
          }];
          setMessages(initialMessages);
          localStorage.setItem(`chat_messages_${connectionId}`, JSON.stringify(initialMessages));
        }
      } else {
        // Process server response
        const data = await response.json();
        console.debug(`[chat] Fetched ${data.length} messages from server`);
        
        if (data.length === 0 && messages.length === 0) {
          // If no messages from server and we haven't initialized, add welcome message
          const initialMessages: Message[] = [{
            id: "welcome",
            connectionId: connectionId,
            senderId: "system",
            recipientId: currentUser.id,
            content: "Start chatting with your connection!",
            timestamp: new Date().toISOString(),
            read: true
          }];
          setMessages(initialMessages);
          
          // Try to save the welcome message to the server
          try {
            await fetch(`/api/connections/${connectionId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(initialMessages[0])
            });
          } catch (err) {
            console.error("[chat] Failed to save welcome message to server");
          }
        } else {
          setMessages(data);
        }
      }
    } catch (error) {
      console.error("[chat] Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !connectionId || !currentUser) return;
    
    try {
      // Get the recipient ID from the connection if we haven't already
      let recipientId = "recipient";
      
      try {
        const connResponse = await fetch(`/api/connections/${connectionId}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (connResponse.ok) {
          const connData = await connResponse.json();
          
          // Set the recipient ID based on which user is the current user
          recipientId = connData.fromUserId === currentUser.id 
            ? connData.toUserId 
            : connData.fromUserId;
        }
      } catch (error) {
        console.error("[chat] Error fetching connection details for sending:", error);
      }
      
      // Create a new message
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        connectionId: connectionId,
        senderId: currentUser.id,
        recipientId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Add message to state for immediate feedback
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      
      // Clear input
      setNewMessage("");
      
      // Try to send message to server
      const response = await fetch(`/api/connections/${connectionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newMsg)
      }).catch(error => {
        console.error("[chat] Network error sending message:", error);
        return null;
      });
      
      // If server send fails, save to localStorage as fallback
      if (!response || !response.ok) {
        console.warn("[chat] Failed to send message to server, saving locally");
        localStorage.setItem(`chat_messages_${connectionId}`, JSON.stringify(updatedMessages));
      } 
      
      // Show typing indicator
      setIsTyping(true);
      
      // Auto-reply for demo purposes (simulate the other user)
      setTimeout(async () => {
        // Hide typing indicator
        setIsTyping(false);
        
        const replyMsg: Message = {
          id: `msg_${Date.now()}`,
          connectionId: connectionId,
          senderId: "recipient", // The other user
          recipientId: currentUser.id,
          content: getAutoReply(newMessage),
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Add reply to state
        const messagesWithReply = [...updatedMessages, replyMsg];
        setMessages(messagesWithReply);
        
        // Try to send reply to server
        try {
          await fetch(`/api/connections/${connectionId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(replyMsg)
          });
        } catch (error) {
          console.warn("[chat] Failed to send auto-reply to server, saving locally");
          localStorage.setItem(`chat_messages_${connectionId}`, JSON.stringify(messagesWithReply));
        }
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
      
    } catch (error) {
      console.error("[chat] Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  // Generate auto-replies for demo purposes
  const getAutoReply = (msg: string): string => {
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
      return `Namaste! I'm excited to help you explore the wonders of Maharashtra. How can I assist with your travel plans?`;
    }
    else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("fee") || lowerMsg.includes("charge")) {
      return `My guiding fee is ₹2,500 per day for Mumbai city tours and ₹3,500 for day trips to places like Elephanta Caves or Kanheri Caves. For multi-day trips to Lonavala, Pune, or Ajanta-Ellora caves, we can discuss a package rate.`;
    }
    else if (lowerMsg.includes("available") || lowerMsg.includes("when") || lowerMsg.includes("date")) {
      return `I'm available next week from Monday to Friday. The best time to visit Maharashtra is from October to March when the weather is pleasant. When are you planning your trip?`;
    }
    else if (lowerMsg.includes("location") || lowerMsg.includes("where") || lowerMsg.includes("place") || lowerMsg.includes("visit")) {
      return `I specialize in tours of Mumbai (Gateway of India, Marine Drive, Elephanta Caves), Pune (Aga Khan Palace, Shaniwar Wada), Ajanta-Ellora caves, hill stations like Lonavala and Matheran, and the beaches of Alibaug and Murud-Janjira. Which areas interest you most?`;
    }
    else if (lowerMsg.includes("food") || lowerMsg.includes("eat") || lowerMsg.includes("restaurant") || lowerMsg.includes("cuisine")) {
      return `Maharashtra has amazing cuisine! I can take you to try authentic vada pav, pav bhaji, Malvani seafood, Kolhapuri mutton, and puran poli. There are great street food tours in Mumbai and special thali experiences throughout the state.`;
    }
    else if (lowerMsg.includes("transport") || lowerMsg.includes("travel") || lowerMsg.includes("get around")) {
      return `We can arrange private transportation for your tour. Mumbai also has excellent public transport including local trains and buses. For trips to Pune or Lonavala, we can take the train or hire a car. What's your preference?`;
    }
    else if (lowerMsg.includes("hotel") || lowerMsg.includes("stay") || lowerMsg.includes("accommodation")) {
      return `I can recommend several hotels and guesthouses based on your budget. Mumbai has options from luxury hotels like Taj Mahal Palace to mid-range and budget accommodations. In places like Lonavala or Matheran, I suggest staying at resorts with mountain views.`;
    }
    else if (lowerMsg.includes("festival") || lowerMsg.includes("event") || lowerMsg.includes("celebration")) {
      return `Maharashtra has vibrant festivals! Ganesh Chaturthi (August/September) is the biggest celebration in Mumbai. There's also Diwali, Holi, and the Pune Festival. Would you like to plan your visit around any of these events?`;
    }
    else if (lowerMsg.includes("thank")) {
      return `You're very welcome! I'm looking forward to showing you the beauty and culture of Maharashtra. Please let me know if you have any other questions.`;
    }
    else {
      return `Thanks for your message about ${msg.substring(0, 20)}... I'll be happy to discuss this further during our tour. Maharashtra has so much to offer, from historical sites to natural beauty and amazing food. What aspects of your trip would you like to focus on?`;
    }
  };
  
  // Format message time for display
  const formatMessageTime = (timestamp: string) => {
    try {
      const messageDate = new Date(timestamp);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Same day, show time only
      if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Yesterday, show "Yesterday" with time
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // This year, show day and month with time
      if (messageDate.getFullYear() === now.getFullYear()) {
        return messageDate.toLocaleDateString([], { 
          day: 'numeric', 
          month: 'short' 
        }) + ', ' + messageDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // Different year, show full date
      return messageDate.toLocaleDateString([], { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric' 
      }) + ', ' + messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };
  
  // Determine if a message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    return message.senderId === currentUser?.id;
  };
  
  // Go back to chat hub
  const handleGoBack = () => {
    setLocation('/chat');
  };
  
  // Check if loading or not authenticated
  if (!isLoggedIn || !currentUser) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center shadow-sm">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{otherUserName}</h1>
            <p className="text-gray-500 text-xs">
              {isLoading ? 'Loading...' : 'Chat with your connection'}
            </p>
          </div>
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              {message.senderId === 'system' ? (
                <div className="bg-gray-100 text-gray-600 rounded-lg p-3 max-w-[80%] text-sm">
                  <p>{message.content}</p>
                </div>
              ) : (
                <div 
                  className={`rounded-lg p-3 max-w-[80%] ${
                    isCurrentUserMessage(message) 
                      ? 'bg-[#DC143C] text-white' 
                      : 'bg-white border text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70 text-right">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs text-gray-500 ml-2">{otherUserName} is typing...</span>
              </div>
            </div>
          )}
          
          {/* Invisible div for scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-3 bg-white border-t flex items-center gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim() || isLoading}
            className="bg-[#DC143C] text-white hover:bg-[#B01030] h-10 w-10 rounded-full flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default ChatPage; 