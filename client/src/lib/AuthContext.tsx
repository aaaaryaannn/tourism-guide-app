import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../shared/schema";
import { API_URL } from './constants';

interface ExtendedUser extends User {
  isGuide?: boolean;
  username?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// API base URL
const API_BASE_URL = API_URL;

// Set user in global window object for compatibility with existing components
const setGlobalUser = (user: ExtendedUser | null) => {
  if (user) {
    (window as any).auth = { user };
    console.log("Setting global auth state with user:", user);
  } else {
    (window as any).auth = null;
    console.log("Cleared global auth state");
  }
};

// Mock user data for demo login
const mockUserData = {
  tourist: {
    id: "tourist-demo-id",
    name: "Demo Tourist",
    email: "tourist@example.com",
    userType: "tourist",
    isGuide: false,
    username: "tourist",
  },
  guide: {
    id: "guide-demo-id",
    name: "Demo Guide", 
    email: "guide@example.com",
    userType: "guide",
    isGuide: true,
    username: "guide",
  }
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setGlobalUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    console.log("Attempting login for:", email);
    setIsLoading(true);
    
    try {
      // Check if this is a demo login
      if ((email === 'tourist' || email === 'guide') && password === 'password') {
        console.log("Using demo login for:", email);
        const userData = {
          ...mockUserData[email as 'tourist' | 'guide'],
          token: `demo-token-${Date.now()}`
        };
        
        // Save token and user data for demo
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setGlobalUser(userData);
        
        return userData;
      }
      
      // Regular API login
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          username: email, // Send email as both email and username
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }

      const data = await response.json();
      
      if (!data.user || !data.token) {
        throw new Error("Invalid response from server");
      }

      // Create user object with isGuide property
      const userData = {
        ...data.user,
        token: data.token,
        isGuide: data.user.userType === 'guide'
      };
      
      // Save token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setGlobalUser(userData);
      
      return userData;
    } catch (error: any) {
      console.error("Login failed:", error.message || error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out");
    setUser(null);
    setGlobalUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Create context value
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isLoggedIn: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the AuthContext for direct import
export { AuthContext };