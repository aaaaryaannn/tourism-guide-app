import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define a base user type if we can't import from schema
type BaseUser = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  userType: 'tourist' | 'guide';
  createdAt: Date;
};

// Extend the User type to include the isGuide property
interface User extends BaseUser {
  isGuide: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Make sure the isGuide property is set for existing users
        if (parsedUser.isGuide === undefined) {
          parsedUser.isGuide = parsedUser.userType === 'guide';
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  async function login(username: string, password: string): Promise<User> {
    try {
      setIsLoading(true);
      
      // Use fetch directly since we need to check the response status and read the body
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      
      // Parse the response body
      const data = await response.json();
      
      // Check if login was successful
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Ensure the user has an ID
      if (!data.id) {
        throw new Error("User ID is missing from login response");
      }
      
      // Add the isGuide property based on userType
      const userData: User = {
        ...data,
        isGuide: data.userType === 'guide',
        id: data.id // Ensure ID is explicitly set
      };
      
      console.log("Setting user data after login:", userData);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // Logout function
  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  // Create the context value
  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}