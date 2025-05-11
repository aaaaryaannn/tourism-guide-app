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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Save token
      localStorage.setItem("token", data.token);
      
      // Save user data
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setGlobalUser(data.user);
      
      return data.user;
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