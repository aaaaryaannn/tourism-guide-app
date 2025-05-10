import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../shared/schema";

// Auth context type
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { throw new Error("AuthProvider not initialized"); },
  logout: () => {},
  isLoading: false,
  isLoggedIn: false
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Set user in global window object for compatibility with existing components
const setGlobalUser = (user: User | null) => {
  if (user) {
    (window as any).auth = { user };
    console.log("Set global user in window.auth:", user);
  } else {
    (window as any).auth = null;
    console.log("Cleared global user from window.auth");
  }
};

// Helper function to create mock user data for demo logins
export const createMockUser = (role: 'user' | 'guide'): User => {
  return {
    id: role === 'guide' ? '101' : '102',
    name: role === 'guide' ? 'Guide Demo' : 'Tourist Demo',
    email: `${role}@example.com`,
    password: 'demo123',
    userType: role,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Immediately create a mock guide user for development
  useEffect(() => {
    console.log("AuthProvider initializing...");
    setIsLoading(true);
    
    // Always force a guide user for development
    const mockUser = createMockUser('guide');
    
    // Set user in state
    setUser(mockUser);
    
    // Set in global window object
    setGlobalUser(mockUser);
    
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(mockUser));
    
    console.log("Development mode: Auto-logged in as guide");
    
    // Short timeout to ensure the user state is properly set before rendering children
    setTimeout(() => {
      setIsLoading(false);
      console.log("AuthProvider initialization complete");
    }, 100);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<User> => {
    console.log("Login attempt for:", username);
    setIsLoading(true);
    
    try {
      // Create mock user based on username
      const userData = createMockUser(username === 'guide' ? 'guide' : 'user');
      
      // Update state
      setUser(userData);
      
      // Set in global window object
      setGlobalUser(userData);
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      console.log("Login success with user data:", userData);
      
      // Short delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return userData;
    } catch (error: any) {
      console.error("Login failed:", error.message || error);
      throw new Error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out");
    
    // Clear user state
    setUser(null);
    
    // Clear from global window object
    setGlobalUser(null);
    
    // Remove from localStorage
    localStorage.removeItem("user");
    
    console.log("Logout complete");
  };

  // Debug output for user state changes
  useEffect(() => {
    console.log("User state changed:", user);
    if (user) {
      console.log("User type:", user.userType);
      console.log("Is guide:", user.isGuide);
      console.log("Window auth object:", (window as any).auth);
    }
  }, [user]);

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
  return context;
}