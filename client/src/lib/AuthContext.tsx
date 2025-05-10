import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../shared/schema";

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

// Set user in global window object for compatibility with existing components
const setGlobalUser = (user: ExtendedUser | null) => {
  if (user) {
    (window as any).auth = { user };
    console.log("Set global user in window.auth:", user);
  } else {
    (window as any).auth = null;
    console.log("Cleared global user from window.auth");
  }
};

// Helper function to create mock user data for demo logins
export const createMockUser = (role: 'user' | 'guide'): ExtendedUser => {
  const mockUser = {
    id: role === 'guide' ? '101' : '102',
    name: role === 'guide' ? 'Guide Demo' : 'Tourist Demo',
    email: `${role}@example.com`,
    password: 'demo123',
    userType: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: 'https://example.com/avatar.jpg',
    phone: '+1234567890',
    username: role === 'guide' ? 'johndoe' : undefined
  };
  return mockUser;
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
  const login = async (email: string, password: string): Promise<User | null> => {
    console.log("Login attempt for:", email);
    setIsLoading(true);
    
    try {
      // Your login logic here
      const user = createMockUser('guide'); // Replace with actual login logic
      setUser(user);
      return user;
    } catch (error: any) {
      console.error("Login failed:", error.message || error);
      return null;
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}